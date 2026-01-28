import { Card } from '@/components/ui/card';

/**
 * Skeleton for stats cards (documents, projects, users)
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card-simple p-5 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton for projects table
 */
export function ProjectsTableSkeleton() {
  return (
    <Card className="card-simple overflow-hidden animate-pulse">
      <table className="table-simple">
        <thead>
          <tr>
            <th><div className="h-4 bg-gray-200 rounded w-16" /></th>
            <th><div className="h-4 bg-gray-200 rounded w-12" /></th>
            <th><div className="h-4 bg-gray-200 rounded w-16" /></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </td>
              <td><div className="h-5 bg-gray-200 rounded w-20" /></td>
              <td><div className="h-4 bg-gray-200 rounded w-8" /></td>
              <td><div className="h-6 bg-gray-200 rounded w-12 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/**
 * Skeleton for recent documents list
 */
export function DocumentsSkeleton() {
  return (
    <Card className="card-simple p-4 animate-pulse">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Skeleton for activity feed
 */
export function ActivitySkeleton() {
  return (
    <Card className="card-simple p-4 animate-pulse">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Skeleton for deadlines widget
 */
export function DeadlinesSkeleton() {
  return (
    <Card className="card-simple p-4 animate-pulse">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Full dashboard skeleton for initial load
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <ProjectsTableSkeleton />
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
          <DeadlinesSkeleton />
        </div>
      </div>
    </div>
  );
}
