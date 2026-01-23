import { Role } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Version sans données sensibles pour le frontend
export type UserPublic = Omit<User, 'passwordHash'>;
