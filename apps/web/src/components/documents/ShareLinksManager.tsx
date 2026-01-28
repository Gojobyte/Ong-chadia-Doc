import { useState } from 'react';
import { Trash2, Loader2, Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useShareLinks, useRevokeShareLink } from '@/hooks/useSharing';
import { formatDate } from '@/lib/utils';

interface ShareLinksManagerProps {
  documentId: string;
}

export function ShareLinksManager({ documentId }: ShareLinksManagerProps) {
  const { data: shareLinks, isLoading, error } = useShareLinks(documentId);
  const revokeLink = useRevokeShareLink();

  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = async () => {
    if (confirmRevoke) {
      await revokeLink.mutateAsync({ documentId, linkId: confirmRevoke });
      setConfirmRevoke(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm">Erreur lors du chargement des liens</p>
      </div>
    );
  }

  if (!shareLinks?.length) {
    return (
      <p className="text-sm text-slate-500 py-2">
        Aucun lien de partage actif
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {shareLinks.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-200 px-2 py-0.5 rounded font-mono">
                    ...{link.token.slice(-8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopyLink(link.token)}
                  >
                    {copiedToken === link.token ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Expire le {formatDate(link.expiresAt)}
                  {link.maxAccessCount !== null && (
                    <span className="ml-2">
                      {link.accessCount}/{link.maxAccessCount} accès
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Par {link.createdBy.firstName} {link.createdBy.lastName}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirmRevoke(link.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!confirmRevoke}
        onOpenChange={(open) => !open && setConfirmRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer ce lien ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le lien ne fonctionnera plus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700"
            >
              {revokeLink.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Révoquer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
