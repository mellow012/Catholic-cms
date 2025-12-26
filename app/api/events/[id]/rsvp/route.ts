// app/api/events/[id]/rsvp/route.ts - RSVP management

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// POST - Create RSVP
export async function POST(
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

    const body = await req.json();
    const { dioceseId, name, email, phone, numberOfGuests } = body;

    if (!dioceseId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get event to check capacity
    const eventDoc = await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .doc(params.id)
      .get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventData = eventDoc.data();

    // Check if event requires RSVP
    if (!eventData?.requiresRSVP) {
      return NextResponse.json({ error: 'Event does not require RSVP' }, { status: 400 });
    }

    // Check capacity
    const currentAttendees = eventData.attendees?.length || 0;
    const totalGuests = numberOfGuests || 1;

    if (eventData.maxAttendees && (currentAttendees + totalGuests) > eventData.maxAttendees) {
      return NextResponse.json({ error: 'Event is at full capacity' }, { status: 400 });
    }

    const rsvpId = uuidv4();

    // Create RSVP record
    const rsvpData = {
      id: rsvpId,
      eventId: params.id,
      userId: verification.uid,
      name,
      email: email || null,
      phone: phone || null,
      numberOfGuests: totalGuests,
      status: 'confirmed',
      createdAt: new Date(),
    };

    // Save RSVP
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .doc(params.id)
      .collection('rsvps')
      .doc(rsvpId)
      .set(rsvpData);

    // Update event attendees array
    await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .doc(params.id)
      .update({
        attendees: [...(eventData.attendees || []), rsvpId],
      });

    return NextResponse.json({
      success: true,
      data: rsvpData,
      message: 'RSVP confirmed successfully',
    });
  } catch (error: any) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get RSVPs for event
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

    const snapshot = await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('events')
      .doc(params.id)
      .collection('rsvps')
      .get();

    const rsvps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: rsvps });
  } catch (error: any) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}