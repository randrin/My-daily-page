import {
  NotifChannel,
  PrismaClient,
  Priority,
  TaskStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

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
  const user = await prisma.user.upsert({
    where: { email: 'demo@mydailypage.dev' },
    update: {},
    create: {
      email: 'demo@mydailypage.dev',
      password: 'password123', // dev seed only — hash in auth module
      phoneNumber: '+33600000000',
      timezone: 'Europe/Paris',
    },
  });

  for (const channel of Object.values(NotifChannel)) {
    await prisma.notificationPreference.upsert({
      where: { userId_channel: { userId: user.id, channel } },
      update: { enabled: true },
      create: { userId: user.id, channel, enabled: true },
    });
  }

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: category.name } },
      update: { color: category.color, icon: category.icon },
      create: { ...category, userId: user.id },
    });
  }

  const workCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: 'work' },
  });

  const taskCount = await prisma.task.count({ where: { userId: user.id } });
  if (taskCount === 0) {
    const task = await prisma.task.create({
      data: {
        title: 'Préparer la présentation client',
        description: 'Créer une présentation pour la réunion',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        userId: user.id,
        categoryId: workCategory?.id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reminders: {
          create: [
            {
              triggerAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              channel: NotifChannel.EMAIL,
            },
          ],
        },
      },
    });

    await prisma.task.createMany({
      data: [
        {
          title: 'Faire les courses',
          description: 'Acheter les produits alimentaires',
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
          userId: user.id,
        },
        {
          title: 'Appeler maman',
          status: TaskStatus.TODO,
          priority: Priority.LOW,
          userId: user.id,
        },
      ],
    });

    console.log(`Seed: created demo task ${task.id}`);
  }

  console.log(`Seed: demo user ${user.id} (${user.email})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
