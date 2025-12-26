// components/RoleGuard.tsx - Protect routes based on roles and permissions

'use client';

import { useAuth } from '@/lib/contexts/AuthContexts';
import { UserRole, ClearanceLevel } from '@/types';
import { hasPermission, PERMISSIONS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: keyof typeof PERMISSIONS;
  requiredClearance?: ClearanceLevel;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  requiredClearance,
  fallback,
  redirectTo = '/auth/sign-in',
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check role
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        router.push('/dashboard');
        return;
      }
    }

    // Check permission
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      router.push('/dashboard');
      return;
    }

    // Check clearance level
    if (requiredClearance) {
      const levels: ClearanceLevel[] = ['parish', 'deanery', 'diocese', 'ecm'];
      const userLevelIndex = levels.indexOf(user.clearanceLevel);
      const requiredLevelIndex = levels.indexOf(requiredClearance);
      
      if (userLevelIndex < requiredLevelIndex) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, requiredRole, requiredPermission, requiredClearance, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return fallback || null;
  }

  // Check role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  // Check permission
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to perform this action.</p>
        </div>
      </div>
    );
  }

  // Check clearance level
  if (requiredClearance) {
    const levels: ClearanceLevel[] = ['parish', 'deanery', 'diocese', 'ecm'];
    const userLevelIndex = levels.indexOf(user.clearanceLevel);
    const requiredLevelIndex = levels.indexOf(requiredClearance);
    
    if (userLevelIndex < requiredLevelIndex) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Insufficient Clearance</h2>
            <p className="mt-2 text-gray-600">Your clearance level is not high enough to access this resource.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Higher-order component version
export function withRoleGuard(
  Component: React.ComponentType<any>,
  options: Omit<RoleGuardProps, 'children'>
) {
  return function ProtectedComponent(props: any) {
    return (
      <RoleGuard {...options}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}