import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  // ============================================
  // 1. Create Super Admin if not exists
  // ============================================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ong-chadia.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`Super Admin: ${superAdmin.email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  Default password: ${adminPassword}`);
    console.log(`  IMPORTANT: Change this password after first login!\n`);
  }

  // ============================================
  // 2. Create default root folders if not exist
  // ============================================
  const defaultFolders = ['Projets', 'Templates', 'Archives'];

  console.log('Checking default folders...');
  for (const folderName of defaultFolders) {
    const existing = await prisma.folder.findFirst({
      where: { name: folderName, parentId: null },
    });

    if (!existing) {
      await prisma.folder.create({
        data: {
          name: folderName,
          parentId: null,
          createdById: superAdmin.id,
        },
      });
      console.log(`  Created folder: ${folderName}`);
    } else {
      console.log(`  Folder exists: ${folderName}`);
    }
  }

  // ============================================
  // 3. Create default tags if not exist
  // ============================================
  const defaultTags = [
    { name: 'Urgent', color: '#EF4444' },
    { name: 'Important', color: '#F59E0B' },
    { name: 'En cours', color: '#3B82F6' },
    { name: 'Termine', color: '#10B981' },
    { name: 'A revoir', color: '#8B5CF6' },
  ];

  console.log('\nChecking default tags...');
  for (const tag of defaultTags) {
    const existing = await prisma.tag.findFirst({
      where: { name: tag.name },
    });

    if (!existing) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          color: tag.color,
          createdById: superAdmin.id,
        },
      });
      console.log(`  Created tag: ${tag.name}`);
    } else {
      console.log(`  Tag exists: ${tag.name}`);
    }
  }

  console.log('\nSeed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
