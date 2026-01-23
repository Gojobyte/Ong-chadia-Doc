import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  X,
  Shield,
} from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@ong-chadia/shared'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth()

  const isSuperAdmin = user?.role === Role.SUPER_ADMIN

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    // Admin link - only for Super-Admin
    ...(isSuperAdmin
      ? [{ icon: Shield, label: 'Utilisateurs', href: '/admin/users' }]
      : []),
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center text-white font-bold">
                OC
              </div>
              <span className="font-bold text-lg text-slate-900">ONG Chadia</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
