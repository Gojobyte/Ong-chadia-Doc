import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  onZoomChange?: (scale: number) => void;
}

export function PdfViewer({ url, onZoomChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInputValue, setPageInputValue] = useState('1');
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('Impossible de charger le PDF');
    setIsLoading(false);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPageNumber((p) => {
      const newPage = Math.max(1, p - 1);
      setPageInputValue(String(newPage));
      return newPage;
    });
    // Scroll to top when changing page
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((p) => {
      const newPage = Math.min(numPages, p + 1);
      setPageInputValue(String(newPage));
      return newPage;
    });
    // Scroll to top when changing page
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [numPages]);

  const handlePageInputChange = (value: string) => {
    setPageInputValue(value);
    const page = parseInt(value, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInputValue, 10);
    if (isNaN(page) || page < 1) {
      setPageInputValue('1');
      setPageNumber(1);
    } else if (page > numPages) {
      setPageInputValue(String(numPages));
      setPageNumber(numPages);
    }
  };

  const zoomIn = useCallback(() => {
    setScale((s) => {
      const newScale = Math.min(3, s + 0.25);
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(0.5, s - 0.25);
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const resetZoom = useCallback(() => {
    setScale(1);
    onZoomChange?.(1);
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [onZoomChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPreviousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage, zoomIn, zoomOut, resetZoom]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <FileText className="w-16 h-16 text-white/40 mb-4" />
        <p className="text-red-400 mb-2">{error}</p>
        <p className="text-white/60 text-sm">Essayez de télécharger le fichier pour le visualiser</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-[400px]">
      {/* PDF Document Container - scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto w-full relative"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60 mt-4">Chargement du PDF...</p>
            </div>
          </div>
        )}

        <div className="flex justify-center p-4 min-h-full">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={null}
              className="shadow-2xl"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>

      {/* Controls - fixed at bottom */}
      {!isLoading && (
        <div className="flex items-center gap-2 mt-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 flex-shrink-0">
          {/* Page navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 text-white text-sm">
            <Input
              type="text"
              value={pageInputValue}
              onChange={(e) => handlePageInputChange(e.target.value)}
              onBlur={handlePageInputBlur}
              onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlur()}
              className="w-12 h-7 text-center bg-white/10 border-white/20 text-white text-sm"
            />
            <span className="text-white/60">/ {numPages}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-white/30 mx-2" />

          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <button
            onClick={resetZoom}
            className="text-white text-sm font-medium w-16 text-center hover:bg-white/10 rounded px-2 py-1"
          >
            {Math.round(scale * 100)}%
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="text-white hover:bg-white/20"
            title="Réinitialiser le zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
