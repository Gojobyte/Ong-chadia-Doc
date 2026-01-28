import { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFilesSelected, disabled }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleClick = () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    };
    input.click();
  };

  return (
    <div
      className={`
        group relative w-full cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div
        className={`
          relative flex flex-col items-center justify-center w-full h-32
          rounded-xl border-2 border-dashed
          transition-all duration-200 ease-in-out
          ${isDragOver
            ? 'border-primary-500 bg-primary-50/50 scale-[1.02]'
            : 'border-slate-300 bg-slate-50/50 hover:border-primary-500 hover:bg-primary-50/30'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div
            className={`
              p-3 rounded-full bg-white shadow-sm mb-3 transition-transform duration-200
              ${isDragOver ? 'scale-110' : 'group-hover:scale-110'}
            `}
          >
            <UploadCloud className="w-6 h-6 text-primary-600" />
          </div>
          <p className="mb-1 text-sm font-medium text-slate-700">
            <span className="text-primary-600 hover:underline">
              Cliquez pour téléverser
            </span>{' '}
            ou glissez-déposez
          </p>
          <p className="text-xs text-slate-500">
            PDF, DOCX, XLSX ou Images (max. 50MB)
          </p>
        </div>
      </div>
    </div>
  );
}
