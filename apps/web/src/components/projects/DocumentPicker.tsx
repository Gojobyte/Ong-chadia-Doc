import { useState, useMemo } from 'react';
import { Search, FileText, X, Check, Loader2, File, Image, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentSearch } from '@/hooks/useDocuments';
import type { DocumentResponse } from '@ong-chadia/shared';

interface DocumentPickerProps {
  selectedDocuments: DocumentResponse[];
  onSelectionChange: (documents: DocumentResponse[]) => void;
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

export function DocumentPicker({ selectedDocuments, onSelectionChange }: DocumentPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Search for documents
  const { data: searchResults, isLoading } = useDocumentSearch({
    q: debouncedSearch || undefined,
    limit: 20,
  });

  const documents = searchResults?.data || [];

  // Filter out already selected documents
  const availableDocuments = useMemo(() => {
    const selectedIds = new Set(selectedDocuments.map((d) => d.id));
    return documents.filter((doc) => !selectedIds.has(doc.id));
  }, [documents, selectedDocuments]);

  const handleSelect = (doc: DocumentResponse) => {
    onSelectionChange([...selectedDocuments, doc]);
  };

  const handleRemove = (docId: string) => {
    onSelectionChange(selectedDocuments.filter((d) => d.id !== docId));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Documents liés
      </label>

      {/* Selected Documents */}
      {selectedDocuments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg text-sm"
            >
              {getFileIcon(doc.mimeType)}
              <span className="text-primary-700 font-medium truncate max-w-[150px]">
                {doc.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="p-0.5 hover:bg-primary-100 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-primary-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher des documents à lier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && (search || documents.length > 0) && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-[280px] overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {search ? 'Aucun document trouvé' : 'Tapez pour rechercher'}
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[280px] divide-y divide-slate-100">
                  {availableDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        handleSelect(doc);
                        setSearch('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
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
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-transparent" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-1.5 text-xs text-slate-500">
        Recherchez et sélectionnez les documents à associer au projet
      </p>
    </div>
  );
}
