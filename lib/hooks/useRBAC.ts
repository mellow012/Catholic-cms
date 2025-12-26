// lib/hooks/useRBAC.ts - Role-Based Access Control Hook

'use client';
import { useState, useEffect } from 'react';
import { AppUser, UserRole, ClearanceLevel } from '@/types';
import { hasPermission, PERMISSIONS } from '@/lib/constants';
import { getCurrentUser } from '@/lib/authHelpers';

export function useRBAC() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  // Check if user has specific permission
  const can = (permission: keyof typeof PERMISSIONS): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Check if user has specific clearance level or higher
  const hasClearance = (requiredLevel: ClearanceLevel): boolean => {
    if (!user) return false;
    
    const levels: ClearanceLevel[] = ['parish', 'deanery', 'diocese', 'ecm'];
    const userLevelIndex = levels.indexOf(user.clearanceLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    
    return userLevelIndex >= requiredLevelIndex;
  };

  // Check if user can access specific diocese
  const canAccessDiocese = (dioceseId: string): boolean => {
    if (!user) return false;
    
    // ECM admins can access all dioceses
    if (user.clearanceLevel === 'ecm') return true;
    
    // Diocese-level users can only access their diocese
    if (user.clearanceLevel === 'diocese') {
      return user.dioceseId === dioceseId;
    }
    
    // Parish/deanery users can only access their diocese
    return user.dioceseId === dioceseId;
  };

  // Check if user can access specific parish
  const canAccessParish = (parishId: string): boolean => {
    if (!user) return false;
    
    // ECM/Diocese admins can access all parishes
    if (['ecm', 'diocese'].includes(user.clearanceLevel)) return true;
    
    // Deanery admins need separate check (would need to fetch deanery parishes)
    if (user.clearanceLevel === 'deanery') {
      // For now, assume they can access (would need backend query in real app)
      return true;
    }
    
    // Parish-level users can only access their parish
    return user.parishId === parishId;
  };

  // Check if user can access specific deanery
  const canAccessDeanery = (deaneryId: string): boolean => {
    if (!user) return false;
    
    // ECM/Diocese admins can access all deaneries
    if (['ecm', 'diocese'].includes(user.clearanceLevel)) return true;
    
    // Deanery admins can only access their deanery
    return user.deaneryId === deaneryId;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get user's scope (what they can see)
  const getScope = () => {
    if (!user) return null;
    
    return {
      level: user.clearanceLevel,
      dioceseId: user.dioceseId,
      deaneryId: user.deaneryId,
      parishId: user.parishId,
    };
  };

  return {
    user,
    loading,
    isAuthenticated,
    can,
    hasRole,
    hasAnyRole,
    hasClearance,
    canAccessDiocese,
    canAccessParish,
    canAccessDeanery,
    getScope,
  };
}

// Hook to require authentication (redirect if not logged in)
export function useRequireAuth() {
  const { user, loading } = useRBAC();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  return { user, loading, shouldRedirect };
}

// Hook to require specific permission
export function useRequirePermission(permission: keyof typeof PERMISSIONS) {
  const { user, loading, can } = useRBAC();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasAccess(can(permission));
    }
  }, [user, loading, permission, can]);

  return { hasAccess, loading };
}