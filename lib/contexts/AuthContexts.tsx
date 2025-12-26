'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from '@/lib/firebase/firebaseConfig';
import { AppUser, UserRole, ClearanceLevel } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context as AuthContextType;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Get fresh token with custom claims
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = idTokenResult.claims;

      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        role: (claims.role as UserRole) || 'READ_ONLY_VIEWER',
        clearanceLevel: (claims.clearanceLevel as ClearanceLevel) || 'parish',
        dioceseId: claims.dioceseId as string | undefined,
        parishId: claims.parishId as string | undefined,
        deaneryId: claims.deaneryId as string | undefined,
        createdAt: new Date(firebaseUser.metadata.creationTime!),
        lastLogin: new Date(firebaseUser.metadata.lastSignInTime!),
      };

      setUser(appUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await loadUser(currentUser);
    }
  };

  const logout = async () => {
    setUser(null);
    await auth.signOut();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, loadUser);
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}