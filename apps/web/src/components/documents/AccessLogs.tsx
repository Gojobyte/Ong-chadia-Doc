import { Loader2, Clock, User, Globe } from 'lucide-react';
import { useAccessLogs } from '@/hooks/useSharing';
import { formatDate } from '@/lib/utils';
import { ACCESS_ACTION_LABELS, AccessAction } from '@ong-chadia/shared';

interface AccessLogsProps {
  documentId: string;
}

export function AccessLogs({ documentId }: AccessLogsProps) {
  const { data, isLoading, error } = useAccessLogs(documentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 py-2">
        Erreur lors du chargement des logs
      </p>
    );
  }

  if (!data?.data?.length) {
    return (
      <p className="text-sm text-slate-500 py-2">
        Aucun accès enregistré
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.data.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm"
        >
          <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-700">
                {ACCESS_ACTION_LABELS[log.action as AccessAction] || log.action}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                {formatDate(log.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              {log.user ? (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {log.user.firstName} {log.user.lastName}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Accès externe
                </span>
              )}
              {log.ipAddress && (
                <span className="font-mono">{log.ipAddress}</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {data.total > data.data.length && (
        <p className="text-xs text-slate-400 text-center pt-2">
          Affichage de {data.data.length} sur {data.total} entrées
        </p>
      )}
    </div>
  );
}
