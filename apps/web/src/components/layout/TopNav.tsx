import { Bell, Menu } from 'lucide-react'
import { Avatar } from '../ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { GlobalSearch } from '@/components/search'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useAuth()

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U'

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
            Dashboard
          </h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <GlobalSearch />
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{fullName}</p>
              <p className="text-xs text-slate-500">{user?.role || 'User'}</p>
            </div>
            <Avatar
              fallback={initials}
              className="cursor-pointer ring-2 ring-white shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
