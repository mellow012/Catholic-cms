// app/api/events/route.ts - Events CRUD operations

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch events
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Build query
    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .orderBy('startDate', 'desc')
      .limit(limit);

    // Filter by parish if specified
    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    const snapshot = await query.get();
    let events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || doc.data().startDate,
      endDate: doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // Client-side filtering
    if (type) {
      events = events.filter((e: any) => e.type === type);
    }

    if (startDate) {
      events = events.filter((e: any) => new Date(e.startDate) >= new Date(startDate));
    }

    if (endDate) {
      events = events.filter((e: any) => new Date(e.startDate) <= new Date(endDate));
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new event
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
    const allowedRoles = ['PARISH_PRIEST', 'PARISH_SECRETARY', 'DEANERY_ADMIN', 'DIOCESAN_SUPER_ADMIN', 'ECM_SUPER_ADMIN'];
    if (!verification.claims?.role || !allowedRoles.includes(verification.claims.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      dioceseId,
      parishId,
      title,
      description,
      type,
      startDate,
      endDate,
      allDay,
      location,
      requiresRSVP,
      maxAttendees,
      resources,
      notes,
    } = body;

    // Validate required fields
    if (!dioceseId || !title || !type || !startDate || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ID
    const eventId = `EVT-${(parishId || dioceseId).toUpperCase()}-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create event record
    const eventData = {
      id: eventId,
      dioceseId,
      parishId: parishId || null,
      title,
      description: description || null,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      allDay: allDay || false,
      location,
      requiresRSVP: requiresRSVP || false,
      maxAttendees: maxAttendees || null,
      attendees: [],
      resources: resources || [],
      reminderSent: false,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: verification.uid,
    };

    // Save to Firestore
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .doc(eventId)
      .set(eventData);

    // Create audit log
    await adminDb.collection('auditLogs').add({
      userId: verification.uid,
      userEmail: verification.email,
      action: 'create',
      resource: 'event',
      resourceId: eventId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...eventData,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        createdAt: eventData.createdAt.toISOString(),
      },
      message: 'Event created successfully',
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}