import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { FolderTree, FolderBreadcrumb } from '@/components/documents'
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List as ListIcon,
  FileText,
  MoreVertical,
  Download,
  Share2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // TODO: Replace with real data from API (Story 2.8)
  const documents = [
    {
      id: 1,
      title: 'Q4 Impact Report 2023',
      type: 'PDF',
      size: '2.4 MB',
      date: 'Jan 12, 2024',
      author: 'Sarah Connor',
      status: 'approved',
    },
    {
      id: 2,
      title: 'Medical Supplies Inventory',
      type: 'XLSX',
      size: '856 KB',
      date: 'Jan 10, 2024',
      author: 'John Doe',
      status: 'review',
    },
    {
      id: 3,
      title: 'Field Operations Manual',
      type: 'DOCX',
      size: '1.2 MB',
      date: 'Jan 08, 2024',
      author: 'Mike Ross',
      status: 'draft',
    },
    {
      id: 4,
      title: 'Beneficiary Data - Zone B',
      type: 'CSV',
      size: '4.1 MB',
      date: 'Jan 05, 2024',
      author: 'Sarah Connor',
      status: 'approved',
    },
    {
      id: 5,
      title: 'Water Project Proposal',
      type: 'PDF',
      size: '3.5 MB',
      date: 'Jan 03, 2024',
      author: 'Jane Smith',
      status: 'review',
    },
    {
      id: 6,
      title: 'Emergency Response Plan',
      type: 'PDF',
      size: '1.8 MB',
      date: 'Dec 28, 2023',
      author: 'Director',
      status: 'approved',
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Folder Tree */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r bg-white overflow-hidden flex-shrink-0"
            >
              <FolderTree
                selectedId={selectedFolderId}
                onSelect={setSelectedFolderId}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  title={sidebarOpen ? 'Masquer les dossiers' : 'Afficher les dossiers'}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="w-5 h-5" />
                  ) : (
                    <PanelLeft className="w-5 h-5" />
                  )}
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                  <p className="text-slate-600">Gérez et organisez vos fichiers.</p>
                </div>
              </div>
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Téléverser
              </Button>
            </div>

            {/* Breadcrumb */}
            <FolderBreadcrumb
              folderId={selectedFolderId}
              onNavigate={setSelectedFolderId}
            />

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-full sm:w-96">
                <Input
                  placeholder="Rechercher par nom, tag, ou auteur..."
                  icon={<Search className="w-4 h-4" />}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  leftIcon={<Filter className="w-4 h-4" />}
                >
                  Filtres
                </Button>
                <div className="h-8 w-px bg-slate-200 mx-1" />
                <Tabs
                  activeTab={viewMode}
                  onChange={(id) => setViewMode(id as 'grid' | 'list')}
                  tabs={[
                    {
                      id: 'grid',
                      label: <LayoutGrid className="w-4 h-4" />,
                    },
                    {
                      id: 'list',
                      label: <ListIcon className="w-4 h-4" />,
                    },
                  ]}
                />
              </div>
            </div>

            {/* Content Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                  >
                    <Link to={`/documents/${doc.id}`}>
                      <Card
                        hoverEffect
                        noPadding
                        className="h-full flex flex-col group cursor-pointer"
                      >
                        {/* Thumbnail Placeholder */}
                        <div className="h-40 bg-slate-100 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                          <FileText className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                          <Badge
                            variant={
                              doc.status === 'approved'
                                ? 'success'
                                : doc.status === 'review'
                                  ? 'warning'
                                  : 'neutral'
                            }
                            className="absolute top-3 right-3 shadow-sm"
                          >
                            {doc.status}
                          </Badge>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
                              {doc.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">
                            {doc.type} • {doc.size}
                          </p>

                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-medium">
                                {doc.author.charAt(0)}
                              </div>
                              <span className="text-xs text-slate-600">
                                {doc.date}
                              </span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card noPadding>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Auteur</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Taille</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="flex items-center gap-3 group-hover:text-primary-700"
                          >
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-900">
                              {doc.title}
                            </span>
                          </Link>
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
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{doc.author}</td>
                        <td className="px-6 py-4 text-slate-600">{doc.date}</td>
                        <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Partager"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
