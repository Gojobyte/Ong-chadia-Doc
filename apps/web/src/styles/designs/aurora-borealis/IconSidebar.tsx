import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Shield,
  Star,
  BarChart3,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Bell,
  Search,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@ong-chadia/shared';

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

function getRoleBadge(role?: Role): { label: string; gradient: string } {
  switch (role) {
    case Role.SUPER_ADMIN:
      return { label: 'Admin', gradient: 'from-pink-400 to-rose-500' };
    case Role.STAFF:
      return { label: 'Staff', gradient: 'from-teal-400 to-cyan-500' };
    default:
      return { label: 'Membre', gradient: 'from-violet-400 to-purple-500' };
  }
}

export function IconSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', gradient: 'from-pink-500 to-rose-500' },
    { icon: FileText, label: 'Documents', href: '/documents', gradient: 'from-fuchsia-500 to-purple-600' },
    { icon: Star, label: 'Favoris', href: '/favorites', gradient: 'from-amber-400 to-orange-500' },
    { icon: FolderKanban, label: 'Projets', href: '/projects', gradient: 'from-teal-400 to-cyan-500' },
  ];

  const toolsNavItems = [
    ...(isStaffOrAbove
      ? [{ icon: BarChart3, label: 'Analytics', href: '/analytics', gradient: 'from-violet-500 to-purple-600' }]
      : []),
    { icon: Users, label: 'Équipe', href: '/team', disabled: true, gradient: 'from-teal-400 to-cyan-500' },
  ];

  const adminNavItems = isSuperAdmin
    ? [
        { icon: Shield, label: 'Utilisateurs', href: '/admin/users', gradient: 'from-rose-500 to-pink-600' },
        { icon: Settings, label: 'Paramètres', href: '/settings', disabled: true, gradient: 'from-violet-400 to-purple-500' },
      ]
    : [];

  const handleLogout = async () => {
    await logout();
  };

  const roleBadge = getRoleBadge(user?.role);

  const renderNavItem = (item: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    gradient: string;
    disabled?: boolean;
  }) => {
    const isActive = location.pathname === item.href ||
      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
    const isDisabled = item.disabled;
    const isItemHovered = isHovered === item.href;

    if (isDisabled) {
      return (
        <div
          key={item.href}
          className="group relative px-3 py-2.5 rounded-xl flex items-center gap-3 cursor-not-allowed opacity-40"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <item.icon className="w-[18px] h-[18px] text-violet-300/50" />
          </div>
          <span className="text-sm font-medium text-violet-300/50">{item.label}</span>
          <span className="ml-auto text-[10px] font-medium bg-white/5 text-violet-300/50 px-2 py-0.5 rounded-full border border-white/5">
            Bientôt
          </span>
        </div>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        onMouseEnter={() => setIsHovered(item.href)}
        onMouseLeave={() => setIsHovered(null)}
        className="group relative block"
      >
        {/* Active background glow */}
        {isActive && (
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-[0.08] blur-sm`} />
        )}

        <div
          className={`
            relative px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 ease-out
            ${isActive
              ? 'bg-white/[0.08]'
              : isItemHovered
                ? 'bg-white/[0.04]'
                : ''
            }
          `}
        >
          {/* Active indicator bar */}
          <div
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ease-out
              ${isActive ? `h-5 bg-gradient-to-b ${item.gradient}` : 'h-0'}
            `}
          />

          {/* Icon container */}
          <div className={`
            relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ease-out
            ${isActive
              ? `bg-gradient-to-br ${item.gradient} shadow-lg`
              : isItemHovered
                ? 'bg-white/[0.08]'
                : 'bg-white/[0.04]'
            }
          `}>
            <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-violet-200/70'}`} />

            {/* Icon glow effect when active */}
            {isActive && (
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-40 blur-md`} />
            )}
          </div>

          <span className={`text-sm font-medium tracking-tight transition-colors ${isActive ? 'text-white' : 'text-violet-200/70 group-hover:text-white'}`}>
            {item.label}
          </span>

          {/* Hover arrow */}
          <ChevronRight
            className={`
              w-4 h-4 ml-auto transition-all duration-300 ease-out text-violet-300/50
              ${isItemHovered && !isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
            `}
          />
        </div>
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#2d1b4e] via-[#1e1338] to-[#150d28] flex flex-col flex-shrink-0 border-r border-white/[0.08]">
      {/* Logo Section */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-500/30 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo1.png"
                alt="CDT"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Sparkles className="w-5 h-5 text-white hidden" />
            </div>
            {/* Status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-400 rounded-full border-[3px] border-[#1e1338] shadow-lg shadow-teal-500/40" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white tracking-tight truncate">
              ONG Chadia
            </h1>
            <p className="text-xs text-slate-500 truncate font-medium">
              Gestion documentaire
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-3">
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-violet-200/70 text-sm transition-all duration-200 group">
          <Search className="w-4 h-4 text-violet-300/50 group-hover:text-pink-400" />
          <span className="flex-1 text-left">Rechercher...</span>
          <kbd className="text-[10px] font-medium bg-white/[0.06] text-violet-300/50 px-1.5 py-0.5 rounded-md border border-white/[0.08]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 mb-5">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/30 transition-all duration-300 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98] group">
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Main Navigation */}
        <div className="mb-6">
          <p className="px-3 mb-3 text-[11px] font-semibold text-violet-400/50 uppercase tracking-widest">
            Navigation
          </p>
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        {/* Tools Section */}
        <div className="mb-6">
          <p className="px-3 mb-3 text-[11px] font-semibold text-violet-400/50 uppercase tracking-widest">
            Outils
          </p>
          <div className="space-y-1">
            {toolsNavItems.map(renderNavItem)}
          </div>
        </div>

        {/* Admin Section */}
        {adminNavItems.length > 0 && (
          <div className="mb-6">
            <p className="px-3 mb-3 text-[11px] font-semibold text-violet-400/50 uppercase tracking-widest">
              Administration
            </p>
            <div className="space-y-1">
              {adminNavItems.map(renderNavItem)}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-white/[0.08]">
        {/* Help & Notifications */}
        <div className="px-3 py-3 flex items-center gap-1">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-violet-200/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Aide</span>
          </button>
          <button className="relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-violet-200/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
            <Bell className="w-4 h-4" />
            <span className="text-xs font-medium">Notifs</span>
            {/* Notification badge */}
            <span className="absolute top-2 right-8 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-pink-500/25">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-400 rounded-full border-2 border-[#1e1338]" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={`inline-flex text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${roleBadge.gradient}`}>
                {roleBadge.label}
              </span>
            </div>

            {/* Dropdown indicator */}
            <ChevronRight className="w-4 h-4 text-violet-300/50 group-hover:text-white transition-colors duration-200" />
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-violet-200/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-rose-500/20 transition-all duration-200">
              <LogOut className="w-[18px] h-[18px]" />
            </div>
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
