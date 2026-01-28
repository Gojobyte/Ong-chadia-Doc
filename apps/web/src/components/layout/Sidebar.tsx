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
  Star,
  Tag,
} from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useFavoritesCount } from '@/hooks/useFavorites'
import { Role } from '@ong-chadia/shared'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth()
  const { data: favoritesCount } = useFavoritesCount()

  const isSuperAdmin = user?.role === Role.SUPER_ADMIN

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    { icon: Star, label: 'Favoris', href: '/favorites', badge: favoritesCount },
    { icon: FolderKanban, label: 'Projets', href: '/projects' },
    { icon: Users, label: 'Équipe', href: '/team', disabled: true },
    { icon: Settings, label: 'Paramètres', href: '/settings', disabled: true },
    // Admin links - only for Super-Admin
    ...(isSuperAdmin
      ? [
          { icon: Shield, label: 'Utilisateurs', href: '/admin/users' },
          { icon: Tag, label: 'Gestion Tags', href: '/admin/tags' },
        ]
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
              <img
                src="/logo.png"
                alt="ONG Chadia"
                className="w-8 h-8 rounded-lg object-cover"
              />
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
            {navItems.map((item) => {
              const isDisabled = 'disabled' in item && item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed"
                    title="Bientôt disponible"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Bientôt</span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.icon === Star ? 'text-amber-500' : ''}`} />
                  {item.label}
                  {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
