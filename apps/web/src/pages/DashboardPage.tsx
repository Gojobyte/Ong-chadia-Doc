import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Users,
  FolderKanban,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { QuickAccessWidget } from '@/components/dashboard/QuickAccessWidget'
import { useDashboard, useRefreshDashboard } from '@/hooks/useDashboard'
import {
  StatsSkeleton,
  ProjectsWidget,
  DocumentsWidget,
  DeadlinesWidget,
} from '@/components/dashboard'
import { Role } from '@ong-chadia/shared'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.firstName || 'User'
  const isAdmin = user?.role === Role.SUPER_ADMIN
  const canCreateProject = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN

  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()
  const { refresh } = useRefreshDashboard()

  const handleRefresh = () => {
    refresh()
    refetch()
  }

  // Stats configuration
  const stats = [
    {
      label: 'Total Documents',
      value: data?.stats.totalDocuments ?? '—',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      href: '/documents',
    },
    {
      label: 'Projets',
      value: data?.stats.totalProjects ?? '—',
      icon: FolderKanban,
      color: 'bg-green-50 text-green-600',
      href: '/projects',
    },
    ...(isAdmin
      ? [
          {
            label: 'Utilisateurs actifs',
            value: data?.stats.totalUsers ?? '—',
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
            href: '/admin/users',
          },
        ]
      : []),
  ]

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Bienvenue, {firstName}
              </h1>
              <p className="text-sm text-gray-500 capitalize">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
                onClick={handleRefresh}
                disabled={isFetching}
                className="btn-simple-outline"
              >
                Rafraîchir
              </Button>
              <Link to="/documents">
                <Button leftIcon={<Plus className="w-4 h-4" />} className="btn-simple">
                  Nouveau document
                </Button>
              </Link>
            </div>
          </div>

          {/* Error State */}
          {isError && (
            <Card className="card-simple p-4 mb-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Erreur lors du chargement des données
                  </p>
                  <p className="text-sm text-red-600">
                    {error instanceof Error ? error.message : 'Une erreur est survenue'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Réessayer
                </Button>
              </div>
            </Card>
          )}

          {/* Stats */}
          {isLoading ? (
            <div className="mb-6">
              <StatsSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat) => {
                const StatIcon = stat.icon
                const content = (
                  <Card className="card-simple p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <StatIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                )

                return stat.href ? (
                  <Link key={stat.label} to={stat.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={stat.label}>{content}</div>
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Projects Widget */}
            <div className="lg:col-span-2">
              <ProjectsWidget
                projects={data?.myProjects || []}
                stats={data?.projects || { total: 0, byStatus: { DRAFT: 0, PREPARATION: 0, IN_PROGRESS: 0, COMPLETED: 0 } }}
                isLoading={isLoading}
                canCreate={canCreateProject}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Deadlines Widget */}
              <DeadlinesWidget
                deadlines={data?.upcomingDeadlines || []}
                isLoading={isLoading}
                limit={5}
              />

              {/* Recent Documents Widget */}
              <DocumentsWidget
                documents={data?.recentDocuments || []}
                isLoading={isLoading}
                limit={5}
              />

              {/* Quick Access */}
              <QuickAccessWidget />
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
