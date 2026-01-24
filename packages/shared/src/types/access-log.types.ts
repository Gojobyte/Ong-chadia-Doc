// Access log types for document audit trail

export enum AccessAction {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  SHARE = 'SHARE',
  SHARE_REVOKE = 'SHARE_REVOKE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SHARE_DOWNLOAD = 'SHARE_DOWNLOAD',
}

export const ACCESS_ACTION_LABELS: Record<AccessAction, string> = {
  [AccessAction.VIEW]: 'Consultation',
  [AccessAction.DOWNLOAD]: 'Téléchargement',
  [AccessAction.SHARE]: 'Partage créé',
  [AccessAction.SHARE_REVOKE]: 'Partage révoqué',
  [AccessAction.EDIT]: 'Modification',
  [AccessAction.DELETE]: 'Suppression',
  [AccessAction.SHARE_DOWNLOAD]: 'Téléchargement via lien',
};

export interface AccessLogResponse {
  id: string;
  documentId: string;
  userId: string | null;
  user: {
    firstName: string;
    lastName: string;
  } | null;
  action: AccessAction;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AccessLogListResponse {
  data: AccessLogResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccessLogQueryParams {
  page?: number;
  pageSize?: number;
}
