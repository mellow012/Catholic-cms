// components/UserMenu.tsx - User dropdown menu with avatar

'use client';

import { useAuth } from '@/lib/contexts/AuthContexts';
import { signOut } from '@/lib/authHelpers';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export function UserMenu() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const initials = getInitials(user.displayName || user.email || 'U');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none">
        {/* User Avatar */}
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-gray-500">
              {user.email}
            </p>
            <p className="text-xs leading-none text-blue-600 font-medium mt-1 capitalize">
              {user.role?.replace(/_/g, ' ').toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}