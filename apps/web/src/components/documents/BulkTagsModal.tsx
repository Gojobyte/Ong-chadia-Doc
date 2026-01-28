import { useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { useBulkAddTags } from '@/hooks/useBulk';
import type { Tag as TagType } from '@/services/tags.service';

interface BulkTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
  onSuccess?: () => void;
}

export function BulkTagsModal({
  open,
  onOpenChange,
  documentIds,
  onSuccess,
}: BulkTagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const { mutate: bulkAddTags, isPending } = useBulkAddTags();

  const handleSubmit = () => {
    if (selectedTags.length === 0) return;

    const existingTagIds = selectedTags
      .filter((t) => !t.id.startsWith('new-'))
      .map((t) => t.id);
    const newTagNames = selectedTags
      .filter((t) => t.id.startsWith('new-'))
      .map((t) => t.name);

    bulkAddTags(
      {
        documentIds,
        tagIds: existingTagIds.length > 0 ? existingTagIds : undefined,
        tagNames: newTagNames.length > 0 ? newTagNames : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedTags([]);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setSelectedTags([]);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-full">
              <Tag className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <DialogTitle>
                Ajouter des tags
              </DialogTitle>
              <DialogDescription>
                À {documentIds.length} document{documentIds.length > 1 ? 's' : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sélectionner ou créer des tags
          </label>
          <TagInput
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Rechercher ou créer un tag..."
          />
          <p className="text-xs text-slate-500 mt-2">
            Les tags seront ajoutés à tous les documents sélectionnés.
          </p>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedTags.length === 0 || isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ajouter les tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
