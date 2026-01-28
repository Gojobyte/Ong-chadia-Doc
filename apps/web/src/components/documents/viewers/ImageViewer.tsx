import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  url: string;
  alt?: string;
  onZoomChange?: (scale: number) => void;
}

export function ImageViewer({ url, alt = 'Preview', onZoomChange }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [url]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => {
      const newScale = Math.min(5, Math.max(0.25, s + delta));
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setPosition((p) => ({
        x: p.x + deltaX,
        y: p.y + deltaY,
      }));
    }
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => {
      const newScale = Math.min(5, s + 0.25);
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(0.25, s - 0.25);
      onZoomChange?.(newScale);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, [onZoomChange]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onZoomChange?.(1);
  }, [onZoomChange]);

  const rotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, rotate]);

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <ImageOff className="w-16 h-16 text-white/40 mb-4" />
        <p className="text-white/60">Impossible de charger l'image</p>
        <p className="text-white/40 text-sm mt-2 max-w-md truncate">{url}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-[400px]">
      {/* Image container */}
      <div
        ref={containerRef}
        className={`
          flex-1 flex items-center justify-center overflow-hidden w-full relative
          ${scale > 1 ? 'cursor-grab' : 'cursor-default'}
          ${isDragging ? 'cursor-grabbing' : ''}
        `}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={url}
          alt={alt}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          className={`max-h-[80vh] max-w-[90vw] object-contain select-none ${isLoading ? 'invisible' : 'visible'}`}
        />
      </div>

      {/* Controls */}
      {!isLoading && !hasError && (
        <div className="flex items-center gap-2 mt-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.25}
            className="text-white hover:bg-white/20"
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
            disabled={scale >= 5}
            className="text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-white/30 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={rotate}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="text-white hover:bg-white/20"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
