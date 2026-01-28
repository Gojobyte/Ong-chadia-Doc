import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import type { UpcomingDeadline } from '@/services/dashboard.service';

interface DeadlinesWidgetProps {
  deadlines: UpcomingDeadline[];
  isLoading?: boolean;
  limit?: number;
}

function getUrgencyConfig(days: number) {
  if (days < 0) {
    return {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      label: 'En retard',
    };
  }
  if (days <= 3) {
    return {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      label: 'Critique',
    };
  }
  if (days <= 7) {
    return {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      label: 'Urgent',
    };
  }
  return {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    label: '',
  };
}

function DeadlinesWidgetSkeleton() {
  return (
    <Card className="card-simple">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DeadlinesWidget({
  deadlines,
  isLoading,
  limit = 5,
}: DeadlinesWidgetProps) {
  if (isLoading) {
    return <DeadlinesWidgetSkeleton />;
  }

  // Sort by urgency (least days first)
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );
  const displayedDeadlines = sortedDeadlines.slice(0, limit);
  const hasMore = deadlines.length > limit;

  const criticalCount = deadlines.filter((d) => d.daysRemaining <= 7).length;

  return (
    <Card className="card-simple">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
            <h3 className="font-semibold text-gray-900">Échéances à venir</h3>
            {deadlines.length > 0 && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                criticalCount > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {deadlines.length}
              </span>
            )}
          </div>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Deadlines list */}
      {displayedDeadlines.length === 0 ? (
        <div className="text-center py-8 px-4">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-1">Aucune échéance proche</p>
          <p className="text-gray-500 text-sm">
            Tous vos projets sont dans les temps
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayedDeadlines.map((deadline) => {
            const urgency = getUrgencyConfig(deadline.daysRemaining);

            return (
              <Link
                key={deadline.id}
                to={`/projects/${deadline.id}`}
                className="block p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgency.bgColor}`}>
                      {deadline.daysRemaining <= 3 ? (
                        <AlertTriangle className={`w-4 h-4 ${urgency.iconColor}`} />
                      ) : (
                        <Clock className={`w-4 h-4 ${urgency.iconColor}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {deadline.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deadline.endDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${urgency.badgeColor}`}>
                    {deadline.daysRemaining < 0
                      ? `${Math.abs(deadline.daysRemaining)}j retard`
                      : deadline.daysRemaining === 0
                        ? "Aujourd'hui"
                        : deadline.daysRemaining === 1
                          ? 'Demain'
                          : `${deadline.daysRemaining}j`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer with "View more" link */}
      {hasMore && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            to="/projects"
            className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir toutes les échéances ({deadlines.length})
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
}
