// app/api/auth/set-claims/route.ts - API route to set custom claims for users

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, verifyToken } from '@/lib/firebase/firebaseAdmin';
import { UserRole, ClearanceLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const verification = await verifyToken(token);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only ECM_SUPER_ADMIN, DIOCESAN_SUPER_ADMIN, and BISHOP can set claims
    const allowedRoles = ['ECM_SUPER_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'BISHOP'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { uid, role, clearanceLevel, dioceseId, parishId, deaneryId } = body;

    // Validate required fields
    if (!uid || !role || !clearanceLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: uid, role, clearanceLevel' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = [
      'PARISH_PRIEST',
      'PARISH_SECRETARY',
      'DEANERY_ADMIN',
      'DIOCESAN_CHANCELLOR',
      'DIOCESAN_ARCHIVE_ADMIN',
      'BISHOP',
      'DIOCESAN_SUPER_ADMIN',
      'ECM_SUPER_ADMIN',
      'READ_ONLY_VIEWER',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate clearance level
    const validClearances: ClearanceLevel[] = ['parish', 'deanery', 'diocese', 'ecm'];
    if (!validClearances.includes(clearanceLevel)) {
      return NextResponse.json(
        { success: false, error: 'Invalid clearance level' },
        { status: 400 }
      );
    }

    // Build claims object
    const claims: any = {
      role,
      clearanceLevel,
    };

    // Add scope IDs based on clearance
    if (clearanceLevel === 'parish' && parishId) {
      claims.parishId = parishId;
      claims.dioceseId = dioceseId; // Parish users need diocese ID too
    }

    if (clearanceLevel === 'deanery' && deaneryId) {
      claims.deaneryId = deaneryId;
      claims.dioceseId = dioceseId;
    }

    if (clearanceLevel === 'diocese' && dioceseId) {
      claims.dioceseId = dioceseId;
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, claims);

    return NextResponse.json({
      success: true,
      message: 'Custom claims set successfully',
      claims,
    });
  } catch (error: any) {
    console.error('Error setting custom claims:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user claims
export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const verification = await verifyToken(token);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get uid from query params
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      // Return current user's claims
      return NextResponse.json({
        success: true,
        uid: verification.uid,
        claims: verification.claims,
      });
    }

    // Only admins can check other users' claims
    const allowedRoles = ['ECM_SUPER_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'BISHOP'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get user record
    const userRecord = await adminAuth.getUser(uid);
    
    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      claims: userRecord.customClaims || {},
    });
  } catch (error: any) {
    console.error('Error getting user claims:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}