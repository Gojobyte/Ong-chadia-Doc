import { useRef, useCallback, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@ong-chadia/shared';
import { toast } from '@/hooks/useToast';

interface UploadButtonProps {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function UploadButton({ onSelect, disabled, className }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList | null): File[] => {
    if (!files) return [];

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
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

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      onSelect(validFiles);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Build accept string from allowed MIME types
  const accept = ALLOWED_MIME_TYPES.join(',');

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        onClick={handleClick}
        disabled={disabled}
        leftIcon={<Upload className="w-4 h-4" />}
        className={className}
      >
        Téléverser
      </Button>
    </>
  );
}
