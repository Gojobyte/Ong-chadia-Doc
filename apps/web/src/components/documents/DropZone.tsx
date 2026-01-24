import { useState, useCallback, type DragEvent, type ReactNode } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@ong-chadia/shared';
import { toast } from '@/hooks/useToast';

interface DropZoneProps {
  children: ReactNode;
  onDrop: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function DropZone({ children, onDrop, disabled, className }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: fichier trop volumineux (max ${MAX_FILE_SIZE / (1024 * 1024)} Mo)`);
        continue;
      }

      // Check file type
      if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
        errors.push(`${file.name}: type de fichier non supporté`);
        continue;
      }

      validFiles.push(file);
    }

    // Show errors
    if (errors.length > 0) {
      toast({
        title: 'Fichiers invalides',
        description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...et ${errors.length - 3} autres` : ''),
        variant: 'destructive',
      });
    }

    return validFiles;
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length > 0) {
      onDrop(validFiles);
    }
  }, [disabled, onDrop, validateFiles]);

  return (
    <div
      className={cn('relative', className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary-50/90 border-2 border-dashed border-primary-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Upload className="w-12 h-12 text-primary-500 mx-auto mb-2" />
            <p className="text-lg font-medium text-primary-700">
              Déposez les fichiers ici
            </p>
            <p className="text-sm text-primary-600">
              PDF, Word, Excel, Images (max {MAX_FILE_SIZE / (1024 * 1024)} Mo)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
