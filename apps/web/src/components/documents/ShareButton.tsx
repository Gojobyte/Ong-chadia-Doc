import { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateShareLink } from '@/hooks/useSharing';
import {
  ExpirationDuration,
  EXPIRATION_LABELS,
  MAX_ACCESS_OPTIONS,
} from '@ong-chadia/shared';

interface ShareButtonProps {
  documentId: string;
}

export function ShareButton({ documentId }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<ExpirationDuration>(
    ExpirationDuration.ONE_DAY
  );
  const [maxAccess, setMaxAccess] = useState<string>('unlimited');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createShareLink = useCreateShareLink();

  const handleCreateLink = async () => {
    const result = await createShareLink.mutateAsync({
      documentId,
      data: {
        expiresIn: duration,
        maxAccessCount: maxAccess === 'unlimited' ? null : parseInt(maxAccess),
      },
    });

    const url = `${window.location.origin}/share/${result.token}`;
    setShareUrl(url);
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setShareUrl(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un lien de partage</DialogTitle>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée de validité</Label>
              <Select
                value={duration}
                onValueChange={(v) => setDuration(v as ExpirationDuration)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPIRATION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAccess">Nombre d'accès maximum</Label>
              <Select value={maxAccess} onValueChange={setMaxAccess}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_ACCESS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value?.toString() ?? 'unlimited'}
                      value={option.value?.toString() ?? 'unlimited'}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateLink}
              className="w-full"
              disabled={createShareLink.isPending}
            >
              {createShareLink.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Générer le lien'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lien de partage</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-shrink-0 w-8 h-8 p-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Ce lien expire dans {EXPIRATION_LABELS[duration]}
              {maxAccess !== 'unlimited' && ` et permet ${maxAccess} accès`}.
            </p>

            <Button
              variant="outline"
              onClick={() => setShareUrl(null)}
              className="w-full"
            >
              Créer un nouveau lien
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
