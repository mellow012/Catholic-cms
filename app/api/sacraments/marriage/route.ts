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
      .where('type', '==', 'marriage')
      .orderBy('date', 'desc')
      .limit(limit);

    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    const snapshot = await query.get();
    const marriages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: marriages });
  } catch (error: any) {
    console.error('Error fetching marriages:', error);
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
      groomFirstName,
      groomLastName,
      groomDateOfBirth,
      brideFirstName,
      brideLastName,
      brideDateOfBirth,
      marriageDate,
      location,
      officiantName,
      witness1Name,
      witness2Name,
      bannsPublished,
      bannsDate1,
      bannsDate2,
      bannsDate3,
      premarriageCourseCompleted,
      civilMarriageDate,
      civilRegistryNumber,
      notes,
    } = body;

    if (!dioceseId || !parishId || !groomFirstName || !groomLastName || 
        !brideFirstName || !brideLastName || !marriageDate || !location || 
        !officiantName || !witness1Name || !witness2Name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const marriageId = `MAR-${parishId.toUpperCase()}-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const marriageData = {
      id: marriageId,
      type: 'marriage',
      dioceseId,
      parishId,
      // Groom
      groomFirstName,
      groomLastName,
      groomName: `${groomFirstName} ${groomLastName}`,
      groomDateOfBirth: groomDateOfBirth ? new Date(groomDateOfBirth) : null,
      // Bride
      brideFirstName,
      brideLastName,
      brideName: `${brideFirstName} ${brideLastName}`,
      brideDateOfBirth: brideDateOfBirth ? new Date(brideDateOfBirth) : null,
      // Marriage details
      date: new Date(marriageDate),
      location,
      officiantName,
      // Witnesses
      witness1Name,
      witness2Name,
      // Pre-marriage
      bannsPublished: bannsPublished || false,
      bannsDate1: bannsDate1 ? new Date(bannsDate1) : null,
      bannsDate2: bannsDate2 ? new Date(bannsDate2) : null,
      bannsDate3: bannsDate3 ? new Date(bannsDate3) : null,
      premarriageCourseCompleted: premarriageCourseCompleted || false,
      // Civil
      civilMarriageDate: civilMarriageDate ? new Date(civilMarriageDate) : null,
      civilRegistryNumber: civilRegistryNumber || null,
      // Meta
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
      .doc(marriageId)
      .set(marriageData);

    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'marriage',
      resourceId: marriageId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: marriageData,
      message: 'Marriage record created successfully',
    });
  } catch (error: any) {
    console.error('Error creating marriage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}