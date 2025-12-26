// app/api/sacraments/search/route.ts - Advanced search for sacraments

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebase/firebaseAdmin';

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
    const type = searchParams.get('type'); // baptism, confirmation, marriage, etc.
    const name = searchParams.get('name');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    // Start with base query
    let query = adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .orderBy('date', 'desc')
      .limit(limit);

    // Apply filters
    if (type) {
      query = query.where('type', '==', type) as any;
    }

    if (parishId) {
      query = query.where('parishId', '==', parishId) as any;
    }

    // Execute query
    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // Client-side filtering (Firestore limitations)
    if (name) {
      const searchTerm = name.toLowerCase();
      results = results.filter((record: any) => {
        const fullName = `${record.firstName || ''} ${record.middleName || ''} ${record.lastName || ''}`.toLowerCase();
        const groomName = `${record.groomName || ''}`.toLowerCase();
        const brideName = `${record.brideName || ''}`.toLowerCase();
        return fullName.includes(searchTerm) || groomName.includes(searchTerm) || brideName.includes(searchTerm);
      });
    }

    if (startDate) {
      results = results.filter((record: any) => new Date(record.date) >= new Date(startDate));
    }

    if (endDate) {
      results = results.filter((record: any) => new Date(record.date) <= new Date(endDate));
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Error searching sacraments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}