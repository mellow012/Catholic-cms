// app/api/sacraments/anointing/route.ts - Anointing of the Sick CRUD operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
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
    const parishId = searchParams.get('parishId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .where('type', '==', 'anointing')
      .orderBy('date', 'desc')
      .limit(limit);

    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    const snapshot = await query.get();
    const anointings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: anointings });
  } catch (error: any) {
    console.error('Error fetching anointings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const allowedRoles = ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      dioceseId,
      parishId,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      anointingDate,
      location,
      priest,
      reason,
      condition,
      notes,
    } = body;

    if (!dioceseId || !parishId || !firstName || !lastName || !anointingDate || !location || !priest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const anointingId = `ANO-${parishId.toUpperCase()}-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const anointingData = {
      id: anointingId,
      type: 'anointing',
      dioceseId,
      parishId,
      firstName,
      middleName: middleName || null,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      date: new Date(anointingDate),
      location,
      priest,
      reason: reason || null,
      condition: condition || null,
      notes: notes || null,
      approved: false,
      certificateUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: verification.uid,
    };

    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(anointingId)
      .set(anointingData);

    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'anointing',
      resourceId: anointingId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: anointingId, ...anointingData },
      message: 'Anointing record created successfully',
    });
  } catch (error: any) {
    console.error('Error creating anointing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}