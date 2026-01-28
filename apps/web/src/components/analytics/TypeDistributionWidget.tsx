import { PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTypeAnalytics } from '@/hooks/useAnalytics';

const TYPE_COLORS: Record<string, string> = {
  pdf: '#ef4444',
  word: '#3b82f6',
  excel: '#22c55e',
  images: '#a855f7',
  texte: '#64748b',
  autres: '#94a3b8',
};

export function TypeDistributionWidget() {
  const { data, isLoading, error } = useTypeAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Répartition par type</h3>
        </div>
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-[160px] h-[160px] rounded-full bg-slate-100" />
          <div className="space-y-2 mt-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-slate-100 rounded w-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Répartition par type</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-[220px] text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  const chartData = data?.data.map((item) => ({
    ...item,
    color: TYPE_COLORS[item.type] || TYPE_COLORS.autres,
  })) || [];

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-slate-900">Répartition par type</h3>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value, _name, props) => {
                const payload = props.payload as { label: string; percentage: number };
                return [`${value} (${payload.percentage}%)`, payload.label];
              }}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}
