// Share link types for document sharing

export enum ExpirationDuration {
  ONE_HOUR = '1h',
  ONE_DAY = '24h',
  ONE_WEEK = '7d',
  ONE_MONTH = '30d',
}

export const EXPIRATION_MS: Record<ExpirationDuration, number> = {
  [ExpirationDuration.ONE_HOUR]: 60 * 60 * 1000,
  [ExpirationDuration.ONE_DAY]: 24 * 60 * 60 * 1000,
  [ExpirationDuration.ONE_WEEK]: 7 * 24 * 60 * 60 * 1000,
  [ExpirationDuration.ONE_MONTH]: 30 * 24 * 60 * 60 * 1000,
};

export const EXPIRATION_LABELS: Record<ExpirationDuration, string> = {
  [ExpirationDuration.ONE_HOUR]: '1 heure',
  [ExpirationDuration.ONE_DAY]: '24 heures',
  [ExpirationDuration.ONE_WEEK]: '7 jours',
  [ExpirationDuration.ONE_MONTH]: '30 jours',
};

export const MAX_ACCESS_OPTIONS = [
  { value: 1, label: '1 accès' },
  { value: 5, label: '5 accès' },
  { value: 10, label: '10 accès' },
  { value: null, label: 'Illimité' },
] as const;

export interface CreateShareLinkDto {
  expiresIn: ExpirationDuration;
  maxAccessCount?: number | null;
}

export interface ShareLinkResponse {
  id: string;
  documentId: string;
  token: string;
  expiresAt: string;
  maxAccessCount: number | null;
  accessCount: number;
  revokedAt: string | null;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export interface ShareLinkListResponse {
  data: ShareLinkResponse[];
}
