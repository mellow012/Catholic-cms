// components/Header.tsx - Fixed header component

'use client';

import { useAuth } from '@/lib/contexts/AuthContexts';
import { signOut } from '@/lib/authHelpers';
import { Bell, Search, ChevronRight, Cross, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  showNav?: boolean;
}

// Role-based navigation configuration
const roleNavigation: Record<string, Array<{ label: string; href: string }>> = {
  ECM_SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/users' },
    { label: 'Dioceses', href: '/dioceses' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ],
  DIOCESAN_SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Parishes', href: '/parishes' },
    { label: 'Users', href: '/users' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ],
  BISHOP: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Parishes', href: '/parishes' },
    { label: 'Reports', href: '/reports' },
  ],
  DIOCESAN_CHANCELLOR: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Records', href: '/records' },
    { label: 'Reports', href: '/reports' },
  ],
  DEANERY_ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Parishes', href: '/parishes' },
    { label: 'Records', href: '/records' },
  ],
  PARISH_PRIEST: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Records', href: '/records' },
    { label: 'Members', href: '/members' },
  ],
  PARISH_SECRETARY: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Records', href: '/records' },
    { label: 'Members', href: '/members' },
  ],
  READ_ONLY_VIEWER: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
  ],
};

export function Header({ title, description, breadcrumbs, actions, showNav = true }: HeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Get navigation links based on user role
  const navLinks = user?.role ? roleNavigation[user.role] || [] : [];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Cross className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MCCMS</h1>
              <p className="text-xs text-gray-500">Malawi Catholic Church</p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <HeaderSearch />
                <HeaderNotifications />
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/sign-in"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Role-Based Navigation */}
        {user && showNav && navLinks.length > 0 && (
          <nav className="flex items-center gap-1 -mx-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Page Header (Title, Breadcrumbs, Actions) */}
      {title && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 py-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Title and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Quick search component for header
export function HeaderSearch({ placeholder = 'Search...' }: { placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="search"
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
      />
    </div>
  );
}

// Notifications button for header
export function HeaderNotifications() {
  return (
    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
      <Bell className="w-5 h-5" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
  );
}