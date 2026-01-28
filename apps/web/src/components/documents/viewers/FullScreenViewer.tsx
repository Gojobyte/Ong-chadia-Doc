import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// Dynamic imports for viewers (PdfViewer is heavy ~600KB)
const ImageViewer = lazy(() => import('./ImageViewer').then(m => ({ default: m.ImageViewer })));
const PdfViewer = lazy(() => import('./PdfViewer').then(m => ({ default: m.PdfViewer })));
const TextViewer = lazy(() => import('./TextViewer').then(m => ({ default: m.TextViewer })));
const OfficeViewer = lazy(() => import('./OfficeViewer').then(m => ({ default: m.OfficeViewer })));
import { documentsService } from '@/services/documents.service';
import { toast } from '@/hooks/useToast';
import type { DocumentResponse } from '@ong-chadia/shared';

// Loading fallback for viewers
function ViewerLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
      <p className="text-white/60 mt-4">Chargement du visualiseur...</p>
    </div>
  );
}

interface FullScreenViewerProps {
  document: DocumentResponse;
  open: boolean;
  onClose: () => void;
  siblingDocuments?: DocumentResponse[];
  onNavigate?: (doc: DocumentResponse) => void;
}

export function FullScreenViewer({
  document: doc,
  open,
  onClose,
  siblingDocuments = [],
  onNavigate,
}: FullScreenViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Find current document index in siblings
  useEffect(() => {
    if (siblingDocuments.length > 0) {
      const index = siblingDocuments.findIndex((d) => d.id === doc.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [doc.id, siblingDocuments]);

  // Fetch preview URL
  useEffect(() => {
    if (!open) return;

    const fetchUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to use existing URL first, then fetch if needed
        const existingUrl = doc.url;
        if (existingUrl) {
          setPreviewUrl(existingUrl);
          setIsLoading(false);
          return;
        }

        const { url } = await documentsService.getDownloadUrl(doc.id);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Failed to get preview URL:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        toast({
          title: 'Erreur',
          description: `Impossible de charger la prévisualisation: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id, open]);

  // Navigation
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 && siblingDocuments.length > 0) {
      const prevDoc = siblingDocuments[currentIndex - 1];
      onNavigate?.(prevDoc);
    }
  }, [currentIndex, siblingDocuments, onNavigate]);

  const goToNext = useCallback(() => {
    if (currentIndex < siblingDocuments.length - 1) {
      const nextDoc = siblingDocuments[currentIndex + 1];
      onNavigate?.(nextDoc);
    }
  }, [currentIndex, siblingDocuments, onNavigate]);

  // Download
  const handleDownload = async () => {
    try {
      const { url } = await documentsService.getDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le fichier',
        variant: 'destructive',
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (siblingDocuments.length > 1) {
            e.preventDefault();
            goToPrevious();
          }
          break;
        case 'ArrowRight':
          if (siblingDocuments.length > 1) {
            e.preventDefault();
            goToNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, goToPrevious, goToNext, siblingDocuments.length]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const renderViewer = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Chargement...</p>
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <FileText className="w-16 h-16 text-white/40 mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-white/60 text-sm mb-4">{error || 'URL non disponible'}</p>
          <Button
            onClick={handleDownload}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger le fichier
          </Button>
        </div>
      );
    }

    const { mimeType, name } = doc;

    // Images
    if (mimeType.startsWith('image/')) {
      return (
        <Suspense fallback={<ViewerLoading />}>
          <ImageViewer url={previewUrl} alt={name} />
        </Suspense>
      );
    }

    // PDF
    if (mimeType === 'application/pdf') {
      return (
        <Suspense fallback={<ViewerLoading />}>
          <PdfViewer url={previewUrl} />
        </Suspense>
      );
    }

    // Text files
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      name.endsWith('.md') ||
      name.endsWith('.json') ||
      name.endsWith('.txt') ||
      name.endsWith('.log')
    ) {
      return (
        <Suspense fallback={<ViewerLoading />}>
          <TextViewer url={previewUrl} mimeType={mimeType} fileName={name} />
        </Suspense>
      );
    }

    // Office documents
    if (
      mimeType.includes('word') ||
      mimeType.includes('document') ||
      mimeType.includes('sheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('presentation') ||
      mimeType.includes('powerpoint')
    ) {
      return (
        <Suspense fallback={<ViewerLoading />}>
          <OfficeViewer
            url={previewUrl}
            fileName={name}
            mimeType={mimeType}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // Fallback - no preview available
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Prévisualisation non disponible</h3>
        <p className="text-white/60 text-sm mb-6">{name}</p>
        <Button
          onClick={handleDownload}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger le fichier
        </Button>
      </div>
    );
  };

  if (!open) return null;

  const hasSiblings = siblingDocuments.length > 1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < siblingDocuments.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-medium truncate max-w-md">
            {doc.name}
          </h2>
          {hasSiblings && (
            <span className="text-white/60 text-sm">
              {currentIndex + 1} / {siblingDocuments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>

          <div className="h-6 w-px bg-white/20 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 w-8 h-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 pt-16 pb-4 px-4 flex items-center justify-center">
        {renderViewer()}
      </div>

      {/* Navigation arrows */}
      {hasSiblings && (
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
              text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={goToNext}
            disabled={!canGoNext}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
              text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-xs">
        <span>Échap pour fermer</span>
        {hasSiblings && <span>← → pour naviguer</span>}
        <span>+/- pour zoomer</span>
      </div>
    </div>
  );
}
