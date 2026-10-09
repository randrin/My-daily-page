import { Injectable } from '@nestjs/common';
import { DataSource, MoreThan, In, LessThanOrEqual, Like } from 'typeorm';
import { User } from '@entities/user.entity';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';
import { NotifChannel, ReminderStatus, TaskStatus } from '@entities/enums';
import { generateMonthlyOccurrence } from '../tasks/monthly-recurrence';
import { parseInboundCommand, snoozeUntil } from './inbound-command';

@Injectable()
export class InboundService {
  constructor(private readonly source: DataSource) {}
  async receive(
    provider: string,
    eventId: string,
    sender: string,
    channel: NotifChannel,
    text: string,
  ) {
    const command = parseInboundCommand(text);
    if (!command)
      return 'Commande inconnue. Utilise FAIT, 1H ou DEMAIN 9H suivie du code de la tâche.';
    const number = sender.replace(/^whatsapp:/, '');
    if (!/^\+[1-9]\d{7,14}$/.test(number)) return 'Expéditeur non reconnu.';
    return this.source.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `inbound-${provider}-${eventId}`,
      ]);
      const prior = await manager.query<{ result: string }[]>(
        'SELECT result FROM notification_inbound_events WHERE provider=$1 AND event_id=$2',
        [provider, eventId],
      );
      if (prior.length) return prior[0].result;
      const users = await manager.find(User, {
        where:
          channel === NotifChannel.SMS
            ? { phoneNumber: number }
            : { whatsappNumber: number },
      });
      let result =
        'Aucune tâche correspondante. Consulte tes tâches dans l’application.';
      if (users.length === 1) {
        const user = users[0];
        // Serialize commands for an account, including simultaneous distinct provider events.
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `inbound-user-${user.id}`,
        ]);
        const reminders = await manager.find(Reminder, {
          where: {
            channel,
            status: ReminderStatus.SENT,
            sentAt: MoreThan(new Date(Date.now() - 7 * 86400000)),
            task: { userId: user.id },
          },
          relations: { task: true },
        });
        const ids = [...new Set(reminders.map((r) => r.taskId))];
        const candidates = ids.length
          ? await manager.find(Task, {
              where: { id: In(ids), userId: user.id },
            })
          : [];
        const selected = candidates.filter((task) =>
          command.taskCode
            ? task.id.replace(/-/g, '').slice(0, 12) === command.taskCode
            : ![TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status),
        );
        if (selected.length > 1)
          result =
            'Plusieurs tâches correspondent : ajoute le code indiqué dans le rappel.';
        if (selected.length === 1) {
          const task = await manager.findOne(Task, {
            where: { id: selected[0].id, userId: user.id },
            lock: { mode: 'pessimistic_write' },
          });
          if (task && task.status === TaskStatus.ARCHIVED)
            result = 'Cette tâche est archivée.';
          else if (task && task.status === TaskStatus.DONE)
            result = 'Cette tâche est déjà terminée.';
          else if (task) {
            if (command.action === 'done') {
              const blockers = await manager.findOne(Task, {
                where: { id: task.id },
                relations: { blockers: true },
              });
              if (
                blockers?.blockers.some(
                  (b) =>
                    ![TaskStatus.DONE, TaskStatus.ARCHIVED].includes(b.status),
                )
              )
                result =
                  'Termine les tâches qui bloquent avant de clôturer celle-ci.';
              else {
                task.status = TaskStatus.DONE;
                await manager.save(task);
                await generateMonthlyOccurrence(manager, task.id);
                await manager.update(
                  Reminder,
                  { taskId: task.id, status: ReminderStatus.PENDING },
                  { status: ReminderStatus.CANCELLED },
                );
                result = 'Tâche terminée. Bravo !';
              }
            } else {
              task.remindersSnoozedUntil = snoozeUntil(
                command.action,
                new Date(),
                user.timezone,
              );
              await manager.save(task);
              await manager.update(
                Reminder,
                {
                  taskId: task.id,
                  triggerAt: LessThanOrEqual(task.remindersSnoozedUntil),
                  status: ReminderStatus.PENDING,
                },
                { status: ReminderStatus.CANCELLED },
              );
              await manager.update(
                Reminder,
                {
                  taskId: task.id,
                  automaticKey: Like(`snooze-${task.id}-%`),
                  status: ReminderStatus.PENDING,
                },
                { status: ReminderStatus.CANCELLED },
              );
              await manager.save(
                Reminder,
                manager.create(Reminder, {
                  automaticKey: `snooze-${task.id}-${provider}-${eventId}`,
                  taskId: task.id,
                  channel,
                  triggerAt: task.remindersSnoozedUntil,
                  status: ReminderStatus.PENDING,
                }),
              );
              result = `Rappel reporté au ${task.remindersSnoozedUntil.toLocaleString('fr-FR', { timeZone: user.timezone })} (${user.timezone}). L’échéance reste inchangée.`;
            }
          }
        }
      }
      await manager.query(
        'INSERT INTO notification_inbound_events(provider,event_id,result) VALUES($1,$2,$3)',
        [provider, eventId, result],
      );
      return result;
    });
  }
}
