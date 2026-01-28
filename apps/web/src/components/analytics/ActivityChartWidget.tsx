import { Activity, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useUploadAnalytics } from '@/hooks/useAnalytics';
import type { Period } from '@/services/analytics.service';

interface ActivityChartWidgetProps {
  period: Period;
}

export function ActivityChartWidget({ period }: ActivityChartWidgetProps) {
  const { data, isLoading, error } = useUploadAnalytics(period);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Activité d'upload</h3>
        </div>
        <div className="h-[200px] bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Activité d'upload</h3>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-900">Activité d'upload</h3>
        </div>
        <span className="text-sm text-slate-500">
          {data?.total || 0} documents uploadés
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data?.data || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            allowDecimals={false}
          />
          <Tooltip
            labelFormatter={(label) => formatTooltipDate(String(label))}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => [
              `${value} upload${value !== 1 ? 's' : ''}`,
              'Uploads',
            ]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1e5cb3"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#1e5cb3' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
