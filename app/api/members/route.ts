// app/api/members/route.ts - Members CRUD operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';
import { generateMemberId } from '@/lib/utils';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch members
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
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Build query
    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('members')
      .orderBy('lastName', 'asc')
      .limit(limit);

    // Filter by parish if specified
    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    const snapshot = await query.get();
    let members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateOfBirth: doc.data().dateOfBirth?.toDate?.()?.toISOString() || doc.data().dateOfBirth,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // Client-side search
    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter((m: any) => {
        const fullName = `${m.firstName} ${m.middleName || ''} ${m.lastName}`.toLowerCase();
        return fullName.includes(searchLower) || 
               m.email?.toLowerCase().includes(searchLower) ||
               m.phone?.includes(search);
      });
    }

    return NextResponse.json({ success: true, data: members, count: members.length });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new member
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
      phone,
      email,
      address,
      baptized,
      confirmed,
      married,
      fatherId,
      motherId,
      spouseId,
      notes,
    } = body;

    // Validate required fields
    if (!dioceseId || !parishId || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ID
    const memberId = generateMemberId(parishId);

    // Create member record
    const memberData = {
      id: memberId,
      dioceseId,
      parishId,
      // Personal Info
      firstName,
      middleName: middleName || null,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      placeOfBirth: placeOfBirth || null,
      gender: gender || null,
      // Contact
      phone: phone || null,
      email: email || null,
      address: address || null,
      // Church Status
      baptized: baptized || false,
      confirmed: confirmed || false,
      married: married || false,
      // Family Links
      fatherId: fatherId || null,
      motherId: motherId || null,
      spouseId: spouseId || null,
      childrenIds: [],
      // Linked Sacraments
      baptismId: null,
      confirmationId: null,
      marriageId: null,
      // Meta
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: verification.uid,
    };

    // Save to Firestore
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('members')
      .doc(memberId)
      .set(memberData);

    // Update parent's children array if father or mother specified
    if (fatherId) {
      await adminDb
        .collection('dioceses')
        .doc(dioceseId)
        .collection('members')
        .doc(fatherId)
        .update({
          childrenIds: FieldValue.arrayUnion(memberId),
        });
    }

    if (motherId) {
      await adminDb
        .collection('dioceses')
        .doc(dioceseId)
        .collection('members')
        .doc(motherId)
        .update({
          childrenIds: FieldValue.arrayUnion(memberId),
        });
    }

    // Create audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'member',
      resourceId: memberId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...memberData,
        dateOfBirth: memberData.dateOfBirth?.toISOString(),
        createdAt: memberData.createdAt.toISOString(),
      },
      message: 'Member created successfully',
    });
  } catch (error: any) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}