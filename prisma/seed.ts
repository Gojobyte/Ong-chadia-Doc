import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@ong-chadia.org' },
    update: {},
    create: {
      email: 'admin@ong-chadia.org',
      passwordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Created Super Admin:', superAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
