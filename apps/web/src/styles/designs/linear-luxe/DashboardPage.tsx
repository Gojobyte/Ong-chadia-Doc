import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  FileText,
  Users,
  FolderKanban,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  Plus,
  Sparkles,
  Star,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { QuickAccessWidget } from '@/components/dashboard/QuickAccessWidget'
import { useProjects } from '@/hooks/useProjects'
import { ProjectStatusBadge } from '@/components/projects'
import { Role } from '@ong-chadia/shared'

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.firstName || 'User'

  // Fetch real projects from API
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ limit: 5 })
  const projects = projectsData?.data || []
  const totalProjects = projectsData?.pagination?.total || 0

  // Check if user can create projects (Staff or Super-Admin)
  const canCreateProject = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN

  const stats = [
    {
      label: 'Total Documents',
      value: '—',
      change: '',
      icon: FileText,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Projets',
      value: projectsLoading ? '...' : String(totalProjects),
      change: '',
      icon: FolderKanban,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-500',
      href: '/projects',
    },
    {
      label: 'Équipe',
      value: '—',
      change: '',
      icon: Users,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      gradient: 'from-violet-500 to-purple-500',
    },
  ]

  const activities = [
    {
      id: 1,
      user: 'Système',
      action: 'Bienvenue sur',
      target: 'ONG Chadia',
      time: 'Maintenant',
    },
  ]

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  Bienvenue, {firstName}
                </h1>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-slate-500">
                Voici l'état de vos projets aujourd'hui.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Clock className="w-4 h-4" />}
                className="border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow"
              >
                Historique
              </Button>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/25"
              >
                Nouveau document
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const content = (
                <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 bg-white group">
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {stat.label}
                      </p>
                      <h3 className="text-3xl font-bold text-slate-900">
                        {stat.value}
                      </h3>
                      {stat.change && (
                        <div className="flex items-center mt-2 text-sm text-emerald-600 font-medium">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" />
                          <span>{stat.change}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </Card>
              );

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {'href' in stat && stat.href ? (
                    <Link to={stat.href}>{content}</Link>
                  ) : (
                    content
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
                    <FolderKanban className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Mes Projets
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {canCreateProject && (
                    <Link to="/projects/new">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Nouveau
                      </Button>
                    </Link>
                  )}
                  <Link to="/projects">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowUpRight className="w-4 h-4" />}
                      className="text-slate-500 hover:text-indigo-600"
                    >
                      Voir tout
                    </Button>
                  </Link>
                </div>
              </div>

              <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50 bg-white">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-slate-500">Chargement...</p>
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      <FolderKanban className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-medium mb-1">Aucun projet pour le moment</p>
                    <p className="text-slate-500 text-sm mb-4">Créez votre premier projet pour commencer</p>
                    {canCreateProject && (
                      <Link to="/projects/new">
                        <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Créer un projet
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Projet</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4">Membres</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects.map((project) => (
                          <tr
                            key={project.id}
                            className="hover:bg-slate-50/60 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                  <FolderKanban className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {project.name}
                                  </p>
                                  {project.description && (
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                      {project.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <ProjectStatusBadge status={project.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 font-medium">{project._count?.members || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/projects/${project.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                  Voir
                                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Sidebar Widgets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Quick Access Widget */}
              <QuickAccessWidget />

              {/* Activity Feed */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Activité récente
                  </h2>
                </div>
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        {index !== activities.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-[-16px] w-px bg-gradient-to-b from-slate-200 to-transparent" />
                        )}
                        <Avatar
                          fallback={activity.user}
                          size="sm"
                          className="shrink-0 z-10 ring-4 ring-white shadow-sm"
                        />
                        <div className="pt-0.5">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-semibold text-indigo-600">
                              {activity.target}
                            </span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    Voir toute l'activité
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
