import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderTree, FolderBreadcrumb, DocumentList } from '@/components/documents'
import {
  Search,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DocumentsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
            </div>

            {/* Breadcrumb */}
            <FolderBreadcrumb
              folderId={selectedFolderId}
              onNavigate={setSelectedFolderId}
            />

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-full sm:w-96">
                <Input
                  placeholder="Rechercher par nom..."
                  icon={<Search className="w-4 h-4" />}
                  className="bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Document List */}
            <DocumentList folderId={selectedFolderId} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
