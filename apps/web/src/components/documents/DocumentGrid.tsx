import { DocumentCard } from './DocumentCard';
import type { DocumentResponse } from '@ong-chadia/shared';

interface DocumentGridProps {
  documents: DocumentResponse[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDocumentClick: (doc: DocumentResponse) => void;
  onDownload: (doc: DocumentResponse) => void;
  onRename: (doc: DocumentResponse) => void;
  onDelete: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onInfo?: (doc: DocumentResponse) => void;
}

export function DocumentGrid({
  documents,
  selectedIds,
  onToggleSelect,
  onDocumentClick,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onInfo,
}: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          selected={selectedIds.has(doc.id)}
          onSelect={onToggleSelect}
          onClick={onDocumentClick}
          onDownload={onDownload}
          onRename={onRename}
          onDelete={onDelete}
          onShare={onShare}
          onInfo={onInfo}
        />
      ))}
    </div>
  );
}
