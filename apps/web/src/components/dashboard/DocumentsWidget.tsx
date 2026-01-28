import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Upload,
  ArrowUpRight,
  Folder,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RecentDocument } from '@/services/dashboard.service';

interface DocumentsWidgetProps {
  documents: RecentDocument[];
  isLoading?: boolean;
  limit?: number;
}

function getDocumentIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  return '📁';
}

function DocumentsWidgetSkeleton() {
  return (
    <Card className="card-simple">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DocumentsWidget({
  documents,
  isLoading,
  limit = 5,
}: DocumentsWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <DocumentsWidgetSkeleton />;
  }

  const displayDocs = documents.slice(0, limit);

  return (
    <Card className="card-simple">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Documents Récents</h3>
          </div>
          <div className="flex gap-2">
            <Link to="/documents">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                className="btn-simple-outline text-sm"
              >
                Upload
              </Button>
            </Link>
            <Link to="/documents">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Documents list */}
      {displayDocs.length === 0 ? (
        <div className="text-center py-8 px-4">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-1">Aucun document</p>
          <p className="text-gray-500 text-sm mb-4">
            Commencez par uploader vos premiers documents
          </p>
          <Link to="/documents">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              className="btn-simple-outline"
            >
              Uploader un document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayDocs.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents?folder=${doc.folder.id}`}
              className="block p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg">
                  {getDocumentIcon(doc.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/documents?folder=${doc.folder.id}`);
                      }}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Folder className="w-3 h-3" />
                      {doc.folder.name}
                    </button>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(new Date(doc.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      {displayDocs.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            to="/documents"
            className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tous les documents
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
}
