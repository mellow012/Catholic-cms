// components/NavSidebar.tsx - Main navigation sidebar with role-based menu items

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  Calendar,
  Users,
  Settings,
  FileText,
  BarChart3,
  Cross,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  children?: NavItem[];
}

export function NavSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { can } = useRBAC();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['sacraments']);

  // Navigation items based on permissions
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Sacraments',
      href: '/sacraments',
      icon: <Database className="w-5 h-5" />,
      permission: 'VIEW_SACRAMENT',
      children: [
        { label: 'All Records', href: '/sacraments', icon: <Database className="w-4 h-4" /> },
        { label: 'Baptisms', href: '/sacraments/baptism', icon: <Database className="w-4 h-4" /> },
        { label: 'Confirmations', href: '/sacraments/confirmation', icon: <Database className="w-4 h-4" /> },
        { label: 'Marriages', href: '/sacraments/marriage', icon: <Database className="w-4 h-4" /> },
        { label: 'Holy Orders', href: '/sacraments/holy-orders', icon: <Database className="w-4 h-4" /> },
        { label: 'Search', href: '/sacraments/search', icon: <Database className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Events',
      href: '/events',
      icon: <Calendar className="w-5 h-5" />,
      permission: 'VIEW_EVENT',
      children: [
        { label: 'Calendar', href: '/events/calendar', icon: <Calendar className="w-4 h-4" /> },
        { label: 'All Events', href: '/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Create Event', href: '/events/create', icon: <Calendar className="w-4 h-4" />, permission: 'CREATE_EVENT' },
      ],
    },
    {
      label: 'Members',
      href: '/members',
      icon: <Users className="w-5 h-5" />,
      permission: 'VIEW_MEMBER',
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      permission: 'VIEW_REPORTS',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return can(permission as any);
  };

  const filteredNavItems = navItems.filter((item) => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300',
          'w-64 flex flex-col',
          'z-50 lg:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Cross className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MCCMS</h1>
              <p className="text-xs text-gray-500">Malawi Catholic</p>
            </div>
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children
                        .filter((child) => hasPermission(child.permission))
                        .map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            )}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
           {/* User Info with Dropdown */}
        {user && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-3 hover:bg-blue-100 p-2 rounded-lg transition-colors outline-none">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.role.replace(/_/g, ' ')}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                      {user.role?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      const { signOut } = await import('@/lib/authHelpers');
                      await signOut();
                      window.location.href = '/auth/sign-in';
                    } catch (error) {
                      console.error('Sign out error:', error);
                    }
                  }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}-

        {/* Removed the separate logout button footer - now in user dropdown */}
      </aside>
    </>
  );
}