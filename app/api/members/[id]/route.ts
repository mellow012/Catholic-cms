// app/api/members/[id]/route.ts - Single member operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';

// GET - Fetch single member with family tree
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
    const includeFamily = searchParams.get('includeFamily') === 'true';

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    const doc = await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('members')
      .doc(params.id)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const data = doc.data();
    const member = {
      id: doc.id,
      ...data,
      dateOfBirth: data?.dateOfBirth?.toDate?.()?.toISOString() || data?.dateOfBirth,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
    };

    // Include family members if requested
    if (includeFamily) {
      const familyIds = [
        data?.fatherId,
        data?.motherId,
        data?.spouseId,
        ...(data?.childrenIds || []),
      ].filter(Boolean);

      const familyMembers: any = {};

      if (familyIds.length > 0) {
        const familyDocs = await Promise.all(
          familyIds.map(id =>
            adminDb
              .collection('dioceses')
              .doc(dioceseId)
              .collection('members')
              .doc(id)
              .get()
          )
        );

        interface FamilyMember {
            id: string;
            firstName?: string;
            middleName?: string;
            lastName?: string;
            dateOfBirth?: string;
            gender?: string;
        }

        familyDocs.forEach((familyDoc) => {
            if (familyDoc.exists) {
                const fData = familyDoc.data();
                familyMembers[familyDoc.id] = {
                    id: familyDoc.id,
                    firstName: fData?.firstName,
                    middleName: fData?.middleName,
                    lastName: fData?.lastName,
                    dateOfBirth: fData?.dateOfBirth?.toDate?.()?.toISOString(),
                    gender: fData?.gender,
                } as FamilyMember;
            }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...member,
          family: familyMembers,
        },
      });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update member
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

    const allowedRoles = ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { dioceseId, ...updateData } = body;

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Convert date string to Date object
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // Update record
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('members')
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
      resource: 'member',
      resourceId: params.id,
      changes: updateData,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete member
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
      .collection('members')
      .doc(params.id)
      .delete();

    // Audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'delete',
      resource: 'member',
      resourceId: params.id,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}