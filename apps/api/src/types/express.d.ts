import type { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserPayload;
      documentFolderId?: string;
    }
  }
}

export {};
