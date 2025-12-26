// app/api/sacraments/holy-orders/route.ts - Holy Orders CRUD operations

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
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .where('type', '==', 'holy_orders')
      .orderBy('date', 'desc')
      .limit(limit);

    const snapshot = await query.get();
    const holyOrders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: holyOrders });
  } catch (error: any) {
    console.error('Error fetching holy orders:', error);
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

    // Only high-level roles can record ordinations
    const allowedRoles = ['BISHOP', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
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
      orderType,
      ordinationDate,
      ordinationLocation,
      bishop,
      incardination,
      notes,
    } = body;

    if (!dioceseId || !firstName || !lastName || !orderType || !ordinationDate || !ordinationLocation || !bishop) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate order type
    if (!['deacon', 'priest', 'bishop'].includes(orderType)) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }

    const holyOrderId = `ORD-${dioceseId.toUpperCase()}-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const holyOrderData = {
      id: holyOrderId,
      type: 'holy_orders',
      dioceseId,
      parishId: parishId || dioceseId, // Ordinations are typically diocese-level
      firstName,
      middleName: middleName || null,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      orderType, // deacon, priest, bishop
      date: new Date(ordinationDate),
      location: ordinationLocation,
      bishop, // Ordaining bishop
      incardination: incardination || dioceseId, // Diocese of incardination
      notes: notes || null,
      approved: true, // Ordinations are auto-approved (recorded by bishop)
      certificateUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: verification.uid,
    };

    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(holyOrderId)
      .set(holyOrderData);

    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'holy_orders',
      resourceId: holyOrderId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: holyOrderId, ...holyOrderData },
      message: 'Holy Orders record created successfully',
    });
  } catch (error: any) {
    console.error('Error creating holy orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}