import { Wallet } from 'lucide-react';

interface ProjectBudgetProps {
  budget: string | null;
}

export function ProjectBudget({ budget }: ProjectBudgetProps) {
  const formatBudget = (amount: string | null): string => {
    if (!amount) return '-';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-5 h-5 text-slate-400" />
        <h3 className="font-semibold text-slate-900">Budget</h3>
      </div>

      {budget ? (
        <p className="text-2xl font-bold text-slate-900">
          {formatBudget(budget)}
        </p>
      ) : (
        <p className="text-sm text-slate-400 italic">
          Budget non défini
        </p>
      )}
    </div>
  );
}
