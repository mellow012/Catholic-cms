// app/api/auth/signout/route.ts - Handle user sign out

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // For client-side Firebase auth, we just redirect
  // The actual sign out happens on the client
  return NextResponse.redirect(new URL('/auth/sign-in', req.url));
}

export async function POST(req: NextRequest) {
  // For client-side Firebase auth, we just redirect
  // The actual sign out happens on the client
  return NextResponse.json({ success: true, redirect: '/auth/sign-in' });
}