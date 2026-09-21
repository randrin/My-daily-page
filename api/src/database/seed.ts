import 'reflect-metadata';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { NotifChannel, Priority, TaskStatus } from '../entities/enums';
import { Category } from '../entities/category.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { Reminder } from '../entities/reminder.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import dataSource from './data-source';

config();

const defaultCategories = [
  { name: 'work', color: '#3b82f6', icon: 'briefcase' },
  { name: 'personal', color: '#8b5cf6', icon: 'user' },
  { name: 'shopping', color: '#f59e0b', icon: 'shopping-cart' },
  { name: 'health', color: '#10b981', icon: 'heart' },
  { name: 'finance', color: '#ef4444', icon: 'wallet' },
  { name: 'education', color: '#06b6d4', icon: 'book' },
  { name: 'other', color: '#6b7280', icon: 'folder' },
];

async function main() {
  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const categories = dataSource.getRepository(Category);
  const preferences = dataSource.getRepository(NotificationPreference);
  const tasks = dataSource.getRepository(Task);
  const reminders = dataSource.getRepository(Reminder);

  const password = await bcrypt.hash('password123', 10);
  let user = await users.findOne({ where: { email: 'demo@mydailypage.dev' } });
  if (!user) {
    user = await users.save(
      users.create({
        email: 'demo@mydailypage.dev',
        password,
        phoneNumber: '+33600000000',
        timezone: 'Europe/Paris',
      }),
    );
  } else {
    user.password = password;
    user = await users.save(user);
  }

  for (const channel of Object.values(NotifChannel)) {
    const existing = await preferences.findOne({
      where: { userId: user.id, channel },
    });
    if (!existing) {
      await preferences.save(
        preferences.create({ userId: user.id, channel, enabled: true }),
      );
    }
  }

  for (const category of defaultCategories) {
    const existing = await categories.findOne({
      where: { userId: user.id, name: category.name },
    });
    if (existing) {
      existing.color = category.color;
      existing.icon = category.icon;
      await categories.save(existing);
    } else {
      await categories.save(
        categories.create({ ...category, userId: user.id }),
      );
    }
  }

  const workCategory = await categories.findOne({
    where: { userId: user.id, name: 'work' },
  });

  const taskCount = await tasks.count({ where: { userId: user.id } });
  if (taskCount === 0) {
    const task = await tasks.save(
      tasks.create({
        title: 'Préparer la présentation client',
        description: 'Créer une présentation pour la réunion',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        userId: user.id,
        categoryId: workCategory?.id ?? null,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    );

    await reminders.save(
      reminders.create({
        taskId: task.id,
        triggerAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        channel: NotifChannel.EMAIL,
      }),
    );

    await tasks.save([
      tasks.create({
        title: 'Faire les courses',
        description: 'Acheter les produits alimentaires',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        userId: user.id,
      }),
      tasks.create({
        title: 'Appeler maman',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        userId: user.id,
      }),
    ]);

    console.log(`Seed: created demo task ${task.id}`);
  }

  console.log(`Seed: demo user ${user.id} (${user.email})`);
  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
