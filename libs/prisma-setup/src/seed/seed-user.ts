import { PrismaSetupService } from '../prisma-setup.service';
import * as bcrypt from 'bcrypt';

export async function seedUser(prisma: PrismaSetupService) {
  const users = [
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
    },
  ];

  const userIds: string[] = [];
  for (const user of users) {
    const created = await prisma.user.create({
      data: {
        ...user,
        id: `user-${Date.now()}-${Math.random()}`,
        password: await bcrypt.hash(user.password, 10),
        role: 'user',
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
      },
    });
    userIds.push(created.id);
  }

  return userIds;
}

export async function seedAdmin(prisma: PrismaSetupService) {
  const admins = [
    {
      username: 'admin_user',
      email: 'admin@example.com',
      password: 'admin123',
    },
  ];

  for (const admin of admins) {
    await prisma.user.create({
      data: {
        ...admin,
        id: `admin-${Date.now()}-${Math.random()}`,
        password: await bcrypt.hash(admin.password, 10),
        role: 'admin',
      },
    });
  }
}
