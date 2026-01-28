import { FileText } from 'lucide-react';

interface ProjectDescriptionProps {
  description: string | null;
}

export function ProjectDescription({ description }: ProjectDescriptionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-slate-400" />
        <h3 className="font-semibold text-slate-900">Description</h3>
      </div>

      {description ? (
        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
          {description}
        </p>
      ) : (
        <p className="text-sm text-slate-400 italic">
          Aucune description
        </p>
      )}
    </div>
  );
}
