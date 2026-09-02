import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

function tokenFromRequest(request: NextRequest) {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

async function getUserId(request: NextRequest) {
  const idToken = tokenFromRequest(request);
  if (!idToken) {
    throw new Error('Unauthorized');
  }
  const adminAuth = await getAdminAuth();
  return (await adminAuth.verifyIdToken(idToken)).uid as string;
}

async function getRequestToken(request: NextRequest) {
  const body = await request.json() as { token?: unknown };
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) {
    throw new Error('A notification token is required.');
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const [uid, token] = await Promise.all([getUserId(request), getRequestToken(request)]);
    const adminDb = await getAdminDb();
    await adminDb.doc(`user/${uid}/pushTokens/${encodeURIComponent(token)}`).set({
      token,
      updatedAt: new Date(),
    }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save notification token.';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const [uid, token] = await Promise.all([getUserId(request), getRequestToken(request)]);
    const adminDb = await getAdminDb();
    await adminDb.doc(`user/${uid}/pushTokens/${encodeURIComponent(token)}`).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to remove notification token.';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}