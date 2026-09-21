import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotifChannel, ReminderStatus } from './enums';
import { Task } from './task.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'trigger_at', type: 'timestamptz' })
  triggerAt: Date;

  @Column({ type: 'enum', enum: NotifChannel, enumName: 'NotifChannel' })
  channel: NotifChannel;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    enumName: 'ReminderStatus',
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @ManyToOne(() => Task, (task) => task.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
