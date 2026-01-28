import { HardDrive, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStorageAnalytics } from '@/hooks/useAnalytics';
import { formatFileSize } from '@/lib/utils';

export function StorageWidget() {
  const { data, isLoading, error } = useStorageAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Stockage</h3>
        </div>
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-[120px] h-[120px] rounded-full bg-slate-100" />
          <div className="h-4 w-32 bg-slate-100 rounded mt-4" />
          <div className="h-3 w-24 bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Stockage</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  const percentage = data?.percentage || 0;
  const color = percentage > 90 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981';

  const chartData = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-slate-900">Stockage</h3>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          {formatFileSize(data?.used || 0)} / {formatFileSize(data?.quota || 0)}
        </p>
        <p className="text-xs text-slate-500">
          {data?.documentCount || 0} documents
        </p>
      </div>
    </div>
  );
}
