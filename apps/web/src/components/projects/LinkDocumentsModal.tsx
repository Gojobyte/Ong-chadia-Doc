import { useState, useMemo } from 'react';
import { X, Search, FileText, Loader2, Link2, Check, File, Image, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useAllDocuments } from '@/hooks/useDocuments';
import { useLinkProjectDocument } from '@/hooks/useProjects';
import type { DocumentResponse } from '@ong-chadia/shared';

interface LinkDocumentsModalProps {
  projectId: string;
  existingDocumentIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (mimeType.includes('image')) {
    return <Image className="w-4 h-4 text-purple-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="w-4 h-4 text-blue-500" />;
  }
  return <File className="w-4 h-4 text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function LinkDocumentsModal({
  projectId,
  existingDocumentIds,
  isOpen,
  onClose,
}: LinkDocumentsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<DocumentResponse[]>([]);

  const debouncedSearch = useDebounce(search, 300);
  const linkDocument = useLinkProjectDocument();

  // Fetch all documents, filter by search if provided
  const { data: searchResults, isLoading } = useAllDocuments({
    q: debouncedSearch,
    limit: 50,
  });

  const documents = searchResults?.data || [];

  // Filter out already linked documents
  const availableDocuments = useMemo(() => {
    const existingIds = new Set(existingDocumentIds);
    const selectedIds = new Set(selectedDocs.map((d) => d.id));
    return documents.filter(
      (doc) => !existingIds.has(doc.id) && !selectedIds.has(doc.id)
    );
  }, [documents, existingDocumentIds, selectedDocs]);

  const handleSelect = (doc: DocumentResponse) => {
    setSelectedDocs((prev) => [...prev, doc]);
  };

  const handleRemove = (docId: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleLinkDocuments = async () => {
    // Link all selected documents one by one
    try {
      for (const doc of selectedDocs) {
        await linkDocument.mutateAsync({
          projectId,
          data: { documentId: doc.id },
        });
      }
      // Reset and close on success
      setSelectedDocs([]);
      setSearch('');
      onClose();
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Failed to link documents:', error);
    }
  };

  const handleClose = () => {
    setSelectedDocs([]);
    setSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-xl shadow-xl z-50 flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lier des documents
              </h2>
              <p className="text-sm text-slate-500">
                Sélectionnez les documents à associer
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Selected Documents */}
        {selectedDocs.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-medium text-slate-500 mb-2">
              {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} sélectionné{selectedDocs.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {getFileIcon(doc.mimeType)}
                  <span className="text-slate-700 truncate max-w-[100px]">
                    {doc.name}
                  </span>
                  <button
                    onClick={() => handleRemove(doc.id)}
                    className="p-0.5 hover:bg-slate-100 rounded"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher des documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : availableDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {search ? 'Aucun document trouvé' : 'Aucun document disponible'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelect(doc)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-primary-300 transition-colors">
                    <Check className="w-3.5 h-3.5 text-transparent group-hover:text-primary-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleLinkDocuments}
            disabled={selectedDocs.length === 0 || linkDocument.isPending}
          >
            {linkDocument.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Liaison...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Lier {selectedDocs.length > 0 ? `(${selectedDocs.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
