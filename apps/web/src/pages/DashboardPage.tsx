import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  FileText,
  Users,
  FolderKanban,
  TrendingUp,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.firstName || 'User'

  const stats = [
    {
      label: 'Total Documents',
      value: '1,248',
      change: '+12%',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Projects',
      value: '24',
      change: '+3',
      icon: FolderKanban,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Team Members',
      value: '156',
      change: '+8',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  const recentDocs = [
    {
      id: 1,
      title: 'Q4 Impact Report - Chad Region',
      type: 'Report',
      date: '2 hours ago',
      status: 'approved',
      author: 'Sarah Connor',
    },
    {
      id: 2,
      title: 'Medical Supplies Inventory',
      type: 'Spreadsheet',
      date: '5 hours ago',
      status: 'review',
      author: 'John Doe',
    },
    {
      id: 3,
      title: 'Water Sanitation Project Proposal',
      type: 'Proposal',
      date: '1 day ago',
      status: 'draft',
      author: 'Mike Ross',
    },
    {
      id: 4,
      title: 'Beneficiary List - Zone A',
      type: 'Data',
      date: '2 days ago',
      status: 'approved',
      author: 'Sarah Connor',
    },
  ]

  const activities = [
    {
      id: 1,
      user: 'Sarah Connor',
      action: 'uploaded',
      target: 'Q4 Impact Report',
      time: '2h ago',
    },
    {
      id: 2,
      user: 'John Doe',
      action: 'commented on',
      target: 'Medical Supplies',
      time: '4h ago',
    },
    {
      id: 3,
      user: 'Mike Ross',
      action: 'created',
      target: 'Water Sanitation Project',
      time: '1d ago',
    },
    {
      id: 4,
      user: 'System',
      action: 'archived',
      target: '2023 Budget',
      time: '2d ago',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-600">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              leftIcon={<Clock className="w-4 h-4" />}
            >
              History
            </Button>
            <Button leftIcon={<FileText className="w-4 h-4" />}>
              New Document
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
            >
              <Card hoverEffect className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-emerald-600 font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>{stat.change}</span>
                    <span className="text-slate-400 font-normal ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Documents
              </h2>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                View All
              </Button>
            </div>

            <Card noPadding className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {doc.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {doc.type} • by {doc.author}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              doc.status === 'approved'
                                ? 'success'
                                : doc.status === 'review'
                                  ? 'warning'
                                  : 'neutral'
                            }
                          >
                            {doc.status.charAt(0).toUpperCase() +
                              doc.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>
            <Card>
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {index !== activities.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-100" />
                    )}
                    <Avatar
                      fallback={activity.user}
                      size="sm"
                      className="shrink-0 z-10 ring-4 ring-white"
                    />
                    <div className="pt-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium text-primary-700">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-sm">
                View All Activity
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
