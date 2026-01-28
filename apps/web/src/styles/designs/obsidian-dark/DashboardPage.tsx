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
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
      gradient: 'from-cyan-400 to-cyan-600',
      glow: 'shadow-cyan-500/20',
    },
    {
      label: 'Projets',
      value: projectsLoading ? '...' : String(totalProjects),
      change: '',
      icon: FolderKanban,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      gradient: 'from-emerald-400 to-green-500',
      glow: 'shadow-emerald-500/20',
      href: '/projects',
    },
    {
      label: 'Équipe',
      value: '—',
      change: '',
      icon: Users,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      gradient: 'from-violet-400 to-purple-500',
      glow: 'shadow-violet-500/20',
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
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        {/* Background glow effects */}
        <div className="fixed top-20 right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  Bienvenue, {firstName}
                </h1>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-slate-400">
                Voici l'état de vos projets aujourd'hui.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Clock className="w-4 h-4" />}
                className="btn-ghost-dark"
              >
                Historique
              </Button>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                className="btn-neon"
              >
                Nouveau document
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const content = (
                <Card className={`card-obsidian-hover relative overflow-hidden group`}>
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">
                        {stat.label}
                      </p>
                      <h3 className="text-3xl font-bold text-white">
                        {stat.value}
                      </h3>
                      {stat.change && (
                        <div className="flex items-center mt-2 text-sm text-emerald-400 font-medium">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" />
                          <span>{stat.change}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg ${stat.glow}`}>
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
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/25">
                    <FolderKanban className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
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
                        className="btn-ghost-dark text-sm"
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
                      className="text-slate-400 hover:text-cyan-400"
                    >
                      Voir tout
                    </Button>
                  </Link>
                </div>
              </div>

              <Card className="card-obsidian overflow-hidden">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                      <p className="text-sm text-slate-400">Chargement...</p>
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                      <FolderKanban className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-white font-medium mb-1">Aucun projet pour le moment</p>
                    <p className="text-slate-400 text-sm mb-4">Créez votre premier projet pour commencer</p>
                    {canCreateProject && (
                      <Link to="/projects/new">
                        <Button className="btn-neon">
                          <Plus className="w-4 h-4 mr-2" />
                          Créer un projet
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800/50 text-slate-400 font-medium border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Projet</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4">Membres</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {projects.map((project) => (
                          <tr
                            key={project.id}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                                  <FolderKanban className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">
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
                                <Users className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-300 font-medium">{project._count?.members || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/projects/${project.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
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
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/25">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Activité récente
                  </h2>
                </div>
                <Card className="card-obsidian">
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        {index !== activities.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-[-16px] w-px bg-gradient-to-b from-slate-700 to-transparent" />
                        )}
                        <Avatar
                          fallback={activity.user}
                          size="sm"
                          className="shrink-0 z-10 ring-4 ring-[#12121a] shadow-sm"
                        />
                        <div className="pt-0.5">
                          <p className="text-sm text-slate-300">
                            <span className="font-semibold text-white">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-semibold text-cyan-400">
                              {activity.target}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-sm text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
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
