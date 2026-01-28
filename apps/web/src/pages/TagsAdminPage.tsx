import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useTags,
  useUpdateTag,
  useDeleteTag,
  useMergeTags,
} from '@/hooks/useTags';
import {
  Search,
  Edit2,
  Trash2,
  Merge,
  Tag as TagIcon,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { Tag } from '@/services/tags.service';

// Common tag colors for the color picker
const TAG_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gris', value: '#64748b' },
];

export default function TagsAdminPage() {
  const { data: tags = [], isLoading } = useTags();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();
  const mergeMutation = useMergeTags();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [mergingTag, setMergingTag] = useState<Tag | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // Sort by usage count descending
  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      const countA = a._count?.documents || 0;
      const countB = b._count?.documents || 0;
      return countB - countA;
    });
  }, [filteredTags]);

  // Available tags for merge (exclude the source tag)
  const mergeTargetOptions = useMemo(() => {
    if (!mergingTag) return [];
    return tags.filter((t) => t.id !== mergingTag.id);
  }, [tags, mergingTag]);

  const handleEditOpen = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleEditSubmit = async () => {
    if (!editingTag) return;
    await updateMutation.mutateAsync({
      id: editingTag.id,
      name: editName,
      color: editColor,
    });
    setEditingTag(null);
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    await deleteMutation.mutateAsync(deletingTag.id);
    setDeletingTag(null);
  };

  const handleMergeOpen = (tag: Tag) => {
    setMergingTag(tag);
    setMergeTargetId('');
  };

  const handleMergeSubmit = async () => {
    if (!mergingTag || !mergeTargetId) return;
    await mergeMutation.mutateAsync({
      sourceTagId: mergingTag.id,
      targetTagId: mergeTargetId,
    });
    setMergingTag(null);
    setMergeTargetId('');
  };

  const totalDocuments = useMemo(() => {
    return tags.reduce((sum, tag) => sum + (tag._count?.documents || 0), 0);
  }, [tags]);

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                <TagIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Gestion des Tags
                  </h1>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-slate-500">
                  Gérez les tags utilisés pour catégoriser les documents.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                <TagIcon className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-slate-700">{tags.length} tags</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700">{totalDocuments} utilisations</span>
              </div>
            </div>
          </motion.header>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 border-0 shadow-lg shadow-slate-200/50 bg-white">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder="Rechercher un tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20"
                />
              </div>
            </Card>
          </motion.div>

          {/* Tags Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                  </div>
                </div>
              ) : sortedTags.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                    <TagIcon className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="text-slate-500">
                    {searchQuery
                      ? 'Aucun tag trouvé pour cette recherche'
                      : 'Aucun tag créé'}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Tag
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Couleur
                      </th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                        Documents
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedTags.map((tag, index) => (
                      <motion.tr
                        key={tag.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                            style={{
                              backgroundColor: tag.color + '15',
                              color: tag.color,
                              border: `1px solid ${tag.color}30`,
                            }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm text-slate-600 font-mono">
                              {tag.color}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                            {tag._count?.documents || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOpen(tag)}
                              title="Modifier"
                              className="hover:bg-indigo-100 hover:text-indigo-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMergeOpen(tag)}
                              title="Fusionner"
                              disabled={tags.length < 2}
                              className="hover:bg-violet-100 hover:text-violet-600"
                            >
                              <Merge className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingTag(tag)}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </motion.div>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingTag}
            onOpenChange={(open) => !open && setEditingTag(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le tag</DialogTitle>
                <DialogDescription>
                  Modifiez le nom ou la couleur du tag. Les modifications seront
                  appliquées à tous les documents associés.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom du tag</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nom du tag"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editColor === color.value
                            ? 'border-slate-900 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="edit-color-custom" className="text-xs">
                      Personnalisée:
                    </Label>
                    <Input
                      id="edit-color-custom"
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <span className="text-sm font-mono text-slate-500">
                      {editColor}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTag(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={!editName.trim() || updateMutation.isPending}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Merge Dialog */}
          <Dialog
            open={!!mergingTag}
            onOpenChange={(open) => !open && setMergingTag(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fusionner les tags</DialogTitle>
                <DialogDescription>
                  Fusionnez "{mergingTag?.name}" avec un autre tag. Tous les
                  documents ayant ce tag seront associés au tag cible, et ce tag
                  sera supprimé.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Attention :</strong> Cette action est irréversible.{' '}
                    {mergingTag?._count?.documents || 0} document(s) seront mis à jour.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merge-target">Tag cible</Label>
                  <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le tag cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {mergeTargetOptions.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}{' '}
                            <span className="text-slate-400">
                              ({tag._count?.documents || 0} docs)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMergingTag(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleMergeSubmit}
                  disabled={!mergeTargetId || mergeMutation.isPending}
                  variant="danger"
                >
                  {mergeMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Fusionner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={!!deletingTag}
            onClose={() => setDeletingTag(null)}
            onConfirm={handleDelete}
            title="Supprimer le tag"
            message={
              <>
                Êtes-vous sûr de vouloir supprimer le tag{' '}
                <strong>"{deletingTag?.name}"</strong> ?
                {deletingTag?._count?.documents ? (
                  <>
                    <br />
                    <br />
                    <span className="text-amber-600">
                      Ce tag est utilisé par{' '}
                      <strong>{deletingTag._count.documents}</strong> document(s).
                      Il sera retiré de tous ces documents.
                    </span>
                  </>
                ) : null}
              </>
            }
            isLoading={deleteMutation.isPending}
            confirmText="Supprimer"
          />
        </div>
      </main>
    </DashboardLayout>
  );
}
