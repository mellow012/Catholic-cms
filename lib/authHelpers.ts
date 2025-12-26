  // lib/authHelper.ts - Authentication helper functions

  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    UserCredential,
    updateProfile,
  } from '@firebase/auth';
  import { NextRequest } from 'next/server';
  import { auth } from './firebase/firebaseConfig';
  import { AppUser, UserRole, ClearanceLevel } from '@/types';
  import { adminAuth } from './firebase/firebaseAdmin';

  // ============================================================================
  // SIGN UP
  // ============================================================================

  export async function signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: boolean; user?: UserCredential; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Note: Custom claims must be set via API route using Admin SDK
      // Call /api/auth/set-claims after signup with default role

      return { success: true, user: userCredential };
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================================
  // SIGN IN
  // ============================================================================

  export async function signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserCredential; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential };
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================================
  // SIGN OUT
  // ============================================================================

  export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // GET CURRENT USER WITH CLAIMS
  // ============================================================================

  export async function getCurrentUser(): Promise<AppUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        
        if (!user) {
          resolve(null);
          return;
        }

        try {
          // Get fresh token with custom claims
          const idTokenResult = await user.getIdTokenResult(true);
          const claims = idTokenResult.claims;

          const appUser: AppUser = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            role: (claims.role as UserRole) || 'READ_ONLY_VIEWER',
            clearanceLevel: (claims.clearanceLevel as ClearanceLevel) || 'parish',
            dioceseId: claims.dioceseId as string | undefined,
            parishId: claims.parishId as string | undefined,
            deaneryId: claims.deaneryId as string | undefined,
            createdAt: new Date(user.metadata.creationTime!),
            lastLogin: new Date(user.metadata.lastSignInTime!),
          };

          resolve(appUser);
        } catch (error) {
          console.error('Error getting user claims:', error);
          resolve(null);
        }
      });
    });
  }

  // ============================================================================
  // REFRESH TOKEN (to get updated claims)
  // ============================================================================

  export async function refreshUserToken(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true); // Force refresh
    }
  }

  // ============================================================================
  // AUTH STATE LISTENER
  // ============================================================================

  export function onAuthStateChange(
    callback: (user: AppUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      const idTokenResult = await firebaseUser.getIdTokenResult();
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

      callback(appUser);
    });
  }

  // ============================================================================
  // GET AUTH TOKEN (for API calls)
  // ============================================================================

  export async function getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

