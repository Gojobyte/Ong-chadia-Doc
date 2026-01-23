# 9. Database Schema

## 9.1 Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// ENUMS
// ============================================

enum Role {
  SUPER_ADMIN
  STAFF
  CONTRIBUTOR
  GUEST
}

enum Permission {
  READ
  WRITE
  ADMIN
}

enum ProjectStatus {
  DRAFT
  PREPARATION
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ProjectRole {
  PROJECT_MANAGER
  MEMBER
  VOLUNTEER
}

enum AccessAction {
  VIEW
  DOWNLOAD
  UPLOAD
  EDIT
  DELETE
  SHARE
}

// ============================================
// USER & AUTH
// ============================================

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  role         Role     @default(GUEST)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  refreshTokens    RefreshToken[]
  createdFolders   Folder[]          @relation("FolderCreator")
  uploadedDocs     Document[]        @relation("DocumentUploader")
  uploadedVersions DocumentVersion[] @relation("VersionUploader")
  createdProjects  Project[]         @relation("ProjectCreator")
  projectMembers   ProjectMember[]
  shareLinks       ShareLink[]
  accessLogs       AccessLog[]
  linkedDocs       ProjectDocument[] @relation("DocumentLinker")

  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique @map("token_hash")
  userId    String    @map("user_id")
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ============================================
// GED - FOLDERS
// ============================================

model Folder {
  id          String   @id @default(uuid())
  name        String
  parentId    String?  @map("parent_id")
  createdById String   @map("created_by_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  parent      Folder?            @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[]           @relation("FolderHierarchy")
  createdBy   User               @relation("FolderCreator", fields: [createdById], references: [id])
  documents   Document[]
  permissions FolderPermission[]

  @@unique([parentId, name])
  @@index([parentId])
  @@index([createdById])
  @@map("folders")
}

model FolderPermission {
  id         String     @id @default(uuid())
  folderId   String     @map("folder_id")
  role       Role
  permission Permission
  createdAt  DateTime   @default(now()) @map("created_at")

  folder Folder @relation(fields: [folderId], references: [id], onDelete: Cascade)

  @@unique([folderId, role])
  @@index([folderId])
  @@map("folder_permissions")
}

// ============================================
// GED - DOCUMENTS
// ============================================

model Document {
  id               String   @id @default(uuid())
  name             String
  mimeType         String   @map("mime_type")
  size             Int
  storagePath      String   @map("storage_path")
  folderId         String   @map("folder_id")
  currentVersionId String?  @unique @map("current_version_id")
  uploadedById     String   @map("uploaded_by_id")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relations
  folder         Folder            @relation(fields: [folderId], references: [id], onDelete: Cascade)
  uploadedBy     User              @relation("DocumentUploader", fields: [uploadedById], references: [id])
  currentVersion DocumentVersion?  @relation("CurrentVersion", fields: [currentVersionId], references: [id])
  versions       DocumentVersion[] @relation("DocumentVersions")
  shareLinks     ShareLink[]
  accessLogs     AccessLog[]
  projectDocs    ProjectDocument[]

  @@index([folderId])
  @@index([uploadedById])
  @@index([name])
  @@index([createdAt])
  @@map("documents")
}

model DocumentVersion {
  id            String   @id @default(uuid())
  documentId    String   @map("document_id")
  versionNumber Int      @map("version_number")
  storagePath   String   @map("storage_path")
  size          Int
  uploadedById  String   @map("uploaded_by_id")
  createdAt     DateTime @default(now()) @map("created_at")

  // Relations
  document          Document  @relation("DocumentVersions", fields: [documentId], references: [id], onDelete: Cascade)
  uploadedBy        User      @relation("VersionUploader", fields: [uploadedById], references: [id])
  currentOfDocument Document? @relation("CurrentVersion")

  @@unique([documentId, versionNumber])
  @@index([documentId])
  @@map("document_versions")
}

model ShareLink {
  id          String   @id @default(uuid())
  documentId  String   @map("document_id")
  token       String   @unique
  expiresAt   DateTime @map("expires_at")
  createdById String   @map("created_by_id")
  accessCount Int      @default(0) @map("access_count")
  createdAt   DateTime @default(now()) @map("created_at")

  document  Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdBy User     @relation(fields: [createdById], references: [id])

  @@index([documentId])
  @@index([token])
  @@index([expiresAt])
  @@map("share_links")
}

model AccessLog {
  id         String       @id @default(uuid())
  documentId String       @map("document_id")
  userId     String?      @map("user_id")
  action     AccessAction
  ipAddress  String?      @map("ip_address")
  userAgent  String?      @map("user_agent")
  createdAt  DateTime     @default(now()) @map("created_at")

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([documentId])
  @@index([userId])
  @@index([createdAt])
  @@map("access_logs")
}

// ============================================
// PROJECTS
// ============================================

model Project {
  id          String        @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(DRAFT)
  startDate   DateTime?     @map("start_date")
  endDate     DateTime?     @map("end_date")
  budget      Decimal?      @db.Decimal(12, 2)
  createdById String        @map("created_by_id")
  isArchived  Boolean       @default(false) @map("is_archived")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  // Relations
  createdBy User              @relation("ProjectCreator", fields: [createdById], references: [id])
  members   ProjectMember[]
  documents ProjectDocument[]

  @@index([createdById])
  @@index([status])
  @@index([endDate])
  @@index([isArchived])
  @@map("projects")
}

model ProjectMember {
  id         String      @id @default(uuid())
  projectId  String      @map("project_id")
  userId     String      @map("user_id")
  role       ProjectRole @default(MEMBER)
  assignedAt DateTime    @default(now()) @map("assigned_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_members")
}

model ProjectDocument {
  id         String   @id @default(uuid())
  projectId  String   @map("project_id")
  documentId String   @map("document_id")
  linkedById String   @map("linked_by_id")
  linkedAt   DateTime @default(now()) @map("linked_at")

  project  Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  linkedBy User     @relation("DocumentLinker", fields: [linkedById], references: [id])

  @@unique([projectId, documentId])
  @@index([projectId])
  @@index([documentId])
  @@map("project_documents")
}
```

## 9.2 Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
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

  // Create default root folders
  const defaultFolders = [
    'Projets',
    'Administration',
    'Ressources Humaines',
    'Bailleurs',
    'Templates',
  ];

  for (const name of defaultFolders) {
    await prisma.folder.upsert({
      where: { parentId_name: { parentId: null, name } },
      update: {},
      create: {
        name,
        createdById: superAdmin.id,
      },
    });
  }

  console.log('Created default folders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---
