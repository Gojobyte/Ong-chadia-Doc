import { Users, Trophy, AlertCircle } from 'lucide-react';
import { useUserAnalytics } from '@/hooks/useAnalytics';
import type { Period } from '@/services/analytics.service';

interface TopContributorsWidgetProps {
  period: Period;
}

export function TopContributorsWidget({ period }: TopContributorsWidgetProps) {
  const { data, isLoading, error } = useUserAnalytics(5, period);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Top contributeurs</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-slate-900">Top contributeurs</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-red-500">
          <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  const users = data?.data || [];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-primary-100 text-primary-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-slate-900">Top contributeurs</h3>
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(index)}`}
                >
                  {getInitials(user.firstName, user.lastName)}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900">
                  {user.uploadCount}
                </span>
                <p className="text-xs text-slate-500">uploads</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
          Aucune activité sur cette période
        </div>
      )}
    </div>
  );
}
