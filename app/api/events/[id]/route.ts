// app/api/events/[id]/route.ts - Single event operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';

// GET - Fetch single event
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
      .collection('events')
      .doc(params.id)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        startDate: data?.startDate?.toDate?.()?.toISOString() || data?.startDate,
        endDate: data?.endDate?.toDate?.()?.toISOString() || data?.endDate,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update event
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

    const allowedRoles = ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { dioceseId, ...updateData } = body;

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Update record
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
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
      resource: 'event',
      resourceId: params.id,
      changes: updateData,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete event
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

    const allowedRoles = ['PARISH_PRIEST', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
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
      .collection('events')
      .doc(params.id)
      .delete();

    // Audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'delete',
      resource: 'event',
      resourceId: params.id,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}