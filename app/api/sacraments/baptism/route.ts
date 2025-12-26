// app/api/sacraments/baptism/route.ts - Baptism CRUD operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/firebaseAdmin';
import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch baptism records
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

    // Build query
    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .where('type', '==', 'baptism')
      .orderBy('date', 'desc')
      .limit(limit);

    // Filter by parish if specified
    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    const snapshot = await query.get();
    const baptisms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: baptisms });
  } catch (error: any) {
    console.error('Error fetching baptisms:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new baptism record
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

    // Check permission
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
      placeOfBirth,
      gender,
      baptismType,
      baptismDate,
      location,
      officiantName,
      registryNumber,
      fatherName,
      motherName,
      godfather,
      godfatherParish,
      godmother,
      godmotherParish,
      witnesses,
      notes,
    } = body;

    // Validate required fields
    if (!dioceseId || !parishId || !firstName || !lastName || !baptismDate || !location || !officiantName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const baptismId = `BAP-${parishId.toUpperCase()}-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create baptism record
    const baptismData = {
      id: baptismId,
      type: 'baptism',
      dioceseId,
      parishId,
      // Subject info
      firstName,
      middleName: middleName || null,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      placeOfBirth: placeOfBirth || null,
      gender: gender || null,
      baptismType: baptismType || 'infant',
      // Sacrament details
      date: new Date(baptismDate),
      location,
      officiantName,
      registryNumber: registryNumber || null,
      // Parents
      fatherName: fatherName || null,
      motherName: motherName || null,
      // Godparents
      godfather: godfather || null,
      godfatherParish: godfatherParish || null,
      godmother: godmother || null,
      godmotherParish: godmotherParish || null,
      // Witnesses
      witnesses: witnesses || [],
      // Meta
      notes: notes || null,
      approved: false,
      certificateUrl: null,
      certificateHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: verification.uid,
    };

    // Save to Firestore
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .doc(baptismId)
      .set(baptismData);

    // Create audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'baptism',
      resourceId: baptismId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...baptismData,
        date: baptismData.date.toISOString(),
        createdAt: baptismData.createdAt.toISOString(),
      },
      message: 'Baptism record created successfully',
    });
  } catch (error: any) {
    console.error('Error creating baptism:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}