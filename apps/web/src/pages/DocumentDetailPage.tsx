import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  History,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function DocumentDetailPage() {
  const { id: _id } = useParams()

  // Mock data based on ID (in a real app, fetch this)
  const document = {
    title: 'Q4 Impact Report 2023 - Chad Region',
    status: 'approved',
    version: '2.4',
    author: 'Sarah Connor',
    created: 'Jan 12, 2024',
    size: '2.4 MB',
    type: 'PDF',
    description:
      'Comprehensive analysis of the Q4 humanitarian interventions in the Chad region, including beneficiary statistics, resource allocation, and impact assessment metrics.',
    tags: ['Report', 'Q4', 'Impact', 'Chad'],
  }

  const history = [
    {
      version: '2.4',
      date: 'Jan 12, 2024',
      user: 'Sarah Connor',
      action: 'Approved and finalized',
    },
    {
      version: '2.3',
      date: 'Jan 11, 2024',
      user: 'John Doe',
      action: 'Updated financial section',
    },
    {
      version: '2.2',
      date: 'Jan 10, 2024',
      user: 'Sarah Connor',
      action: 'Incorporated feedback',
    },
  ]

  const comments = [
    {
      id: 1,
      user: 'Mike Ross',
      avatar: 'MR',
      text: 'Great work on the executive summary. The metrics are very clear.',
      time: '2 days ago',
    },
    {
      id: 2,
      user: 'Jane Smith',
      avatar: 'JS',
      text: 'Can we double check the beneficiary count in Zone B? It seems low compared to last month.',
      time: '1 day ago',
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-2">
          <Link to="/documents">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Documents
            </Button>
          </Link>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {document.title}
              </h1>
              <Badge variant="success">{document.status}</Badge>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                v{document.version}
              </span>
            </div>
            <p className="text-slate-600 max-w-2xl">{document.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share
            </Button>
            <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
              Edit
            </Button>
            <Button leftIcon={<Download className="w-4 h-4" />}>
              Download
            </Button>
            <Button
              variant="danger"
              className="bg-red-50 text-red-600 hover:bg-red-100 shadow-none border-transparent"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content - Preview */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="min-h-[500px] flex items-center justify-center bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-primary-600">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Document Preview
                  </h3>
                  <p className="text-slate-500">
                    This is a placeholder for the PDF viewer integration.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Open in New Tab
                </Button>
              </div>
            </Card>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Comments
              </h3>
              <Card>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar fallback={comment.avatar} size="sm" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">
                            {comment.user}
                          </span>
                          <span className="text-xs text-slate-500">
                            {comment.time}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-100 flex gap-4">
                    <Avatar fallback="SC" size="sm" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                      />
                      <Button size="sm">Post</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar - Metadata */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Author</p>
                    <p className="text-sm font-medium text-slate-900">
                      {document.author}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm font-medium text-slate-900">
                      {document.created}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Format</p>
                    <p className="text-sm font-medium text-slate-900">
                      {document.type} ({document.size})
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Version History</span>
                <History className="w-4 h-4 text-slate-400" />
              </h3>
              <div className="relative space-y-6 pl-2">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-100" />
                {history.map((item, index) => (
                  <div key={index} className="relative pl-6">
                    <div
                      className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-primary-500' : 'bg-slate-300'}`}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">
                          v{item.version}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {item.action}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        by {item.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
