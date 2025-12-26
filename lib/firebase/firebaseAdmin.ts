import admin from "firebase-admin";
import 'firebase-admin/storage';
import { NextRequest, NextResponse } from "next/server";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;

  export async function getAuthenticatedUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization token provided");
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return decodedToken;
    } catch (error: any) {
      console.error("Token verification failed:", error);
      throw new Error("Invalid or expired token");
    }
  }

// Helper: Set custom claims for RBAC
export async function setUserClaims(
  uid: string,
  claims: {
    role: string;
    clearanceLevel: string;
    dioceseId?: string;
    parishId?: string;
    deaneryId?: string;
  }
) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error: any) {
    console.error('Error setting custom claims:', error);
    return { success: false, error: error.message };
  }
}

// Helper: Verify ID token and extract claims
export async function verifyToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      claims: {
        role: decodedToken.role,
        clearanceLevel: decodedToken.clearanceLevel,
        dioceseId: decodedToken.dioceseId,
        parishId: decodedToken.parishId,
        deaneryId: decodedToken.deaneryId,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper: Check if user has required clearance level
export function hasRequiredClearance(
  userLevel: string,
  requiredLevel: string
): boolean {
  const levels = ['parish', 'deanery', 'diocese', 'ecm'];
  const userIndex = levels.indexOf(userLevel);
  const requiredIndex = levels.indexOf(requiredLevel);
  return userIndex >= requiredIndex;
}