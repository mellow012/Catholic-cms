// app/api/auth/signup/route.ts - Handle user registration and set default claims

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, inviteCode } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // TODO: Validate invite code (for production, only allow signup with valid invite)
    // For now, we'll allow open signup with default READ_ONLY_VIEWER role
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
    });

    // Set default custom claims (READ_ONLY_VIEWER with parish clearance)
    // Admin will upgrade permissions later
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'READ_ONLY_VIEWER',
      clearanceLevel: 'parish',
    });

    // Create user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 'READ_ONLY_VIEWER',
      clearanceLevel: 'parish',
      createdAt: new Date().toISOString(),
      inviteCode: inviteCode || null,
      approved: false, // Require admin approval
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please wait for admin approval.',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    let errorMessage = 'Failed to create user';
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}