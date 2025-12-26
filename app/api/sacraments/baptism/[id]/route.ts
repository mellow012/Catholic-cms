// app/api/sacraments/baptism/[id]/route.ts - Single baptism operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';

// GET - Fetch single baptism record
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const verification = await verifyToken(token);

    if (!verification.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dioceseId = searchParams.get('dioceseId') || verification.claims?.dioceseId;

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    const doc = await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(params.id)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Baptism not found' }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        date: data?.date?.toDate?.()?.toISOString() || data?.date,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching baptism:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update baptism record
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const verification = await verifyToken(token);

    if (!verification.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const allowedRoles = ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_CHANCELLOR', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { dioceseId, ...updateData } = body;

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Update record
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(params.id)
      .update({
        ...updateData,
        updatedAt: new Date(),
      });

    // Audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'update',
      resource: 'baptism',
      resourceId: params.id,
      changes: updateData,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Baptism updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating baptism:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete baptism record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const verification = await verifyToken(token);

    if (!verification.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const allowedRoles = ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dioceseId = searchParams.get('dioceseId') || verification.claims?.dioceseId;

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(params.id)
      .delete();

    // Audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'delete',
      resource: 'baptism',
      resourceId: params.id,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Baptism deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting baptism:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}