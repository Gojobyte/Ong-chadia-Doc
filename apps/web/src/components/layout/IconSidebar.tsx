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

export function IconSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const isStaffOrAbove = user?.role === Role.STAFF || user?.role === Role.SUPER_ADMIN;

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    { icon: Star, label: 'Favoris', href: '/favorites' },
    { icon: FolderKanban, label: 'Projets', href: '/projects' },
  ];

  const toolsNavItems = [
    ...(isStaffOrAbove
      ? [{ icon: BarChart3, label: 'Analytics', href: '/analytics' }]
      : []),
    { icon: Users, label: 'Équipe', href: '/team', disabled: true },
  ];

  const adminNavItems = isSuperAdmin
    ? [
        { icon: Shield, label: 'Utilisateurs', href: '/admin/users' },
        { icon: Settings, label: 'Paramètres', href: '/settings', disabled: true },
      ]
    : [];

  const handleLogout = async () => {
    await logout();
  };

  const renderNavItem = (item: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    disabled?: boolean;
  }) => {
    const isActive = location.pathname === item.href ||
      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

    if (item.disabled) {
      return (
        <div
          key={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed"
        >
          <item.icon className="w-5 h-5" />
          <span className="text-sm">{item.label}</span>
          <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
            Bientôt
          </span>
        </div>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <img
              src="/logo1.png"
              alt="CDT"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">ONG Chadia</h1>
            <p className="text-xs text-gray-500">Gestion documentaire</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
          <Search className="w-4 h-4" />
          <span>Rechercher...</span>
          <kbd className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* New Document Button */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            Navigation
          </p>
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="mb-4">
          <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            Outils
          </p>
          <div className="space-y-1">
            {toolsNavItems.map(renderNavItem)}
          </div>
        </div>

        {adminNavItems.length > 0 && (
          <div className="mb-4">
            <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Administration
            </p>
            <div className="space-y-1">
              {adminNavItems.map(renderNavItem)}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
