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
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!dioceseId) {
      return NextResponse.json({ error: 'Diocese ID required' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('dioceses')
      .doc(dioceseId)
      .collection('sacraments')
      .get();

    const sacraments = snapshot.docs.map(doc => doc.data());

    // Group by type and count
    const stats: any = {
      baptism: 0,
      confirmation: 0,
      marriage: 0,
      holy_orders: 0,
      anointing: 0,
      total: sacraments.length,
      byMonth: {},
    };

    sacraments.forEach((s: any) => {
      if (s.type) {
        stats[s.type] = (stats[s.type] || 0) + 1;
      }

      // Monthly breakdown
      if (s.date) {
        const date = s.date.toDate();
        const month = date.toLocaleString('default', { month: 'short' });
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      }
    });

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}