import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

type UserRole = 'admin' | 'employee';

function hasAuthCode(error: unknown, code: string) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: string }).code === code;
}

function isRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'employee';
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function getAdminClients(): Promise<{ adminAuth: Auth; adminDb: Firestore }> {
  try {
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebaseAdmin');
    return {
      adminAuth: getAdminAuth(),
      adminDb: getAdminDb(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Firebase Admin SDK initialization failed.';
    throw new Error(`Server configuration error: ${message}`);
  }
}

async function ensureAdminRequest(request: NextRequest) {
  const { adminAuth, adminDb } = await getAdminClients();
  const authHeader = request.headers.get('authorization') || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing bearer token.');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    throw new Error('Unauthorized: missing bearer token.');
  }

  const decoded = await adminAuth.verifyIdToken(token);

  if (decoded.role === 'admin') {
    return decoded.uid;
  }

  const adminDoc = await adminDb.collection('admin').doc(decoded.uid).get();

  if (!adminDoc.exists || adminDoc.data()?.active !== true) {
    throw new Error('Forbidden: admin access required.');
  }

  return decoded.uid;
}

async function upsertRoleDocuments(params: {
  adminAuth: Auth;
  adminDb: Firestore;
  uid: string;
  role: UserRole;
  email: string;
  name: string;
  active: boolean;
  department: string;
  actorUid: string;
  setClaims?: boolean;
}) {
  const { adminAuth, adminDb, uid, role, email, name, active, department, actorUid, setClaims = true } = params;

  await adminDb.collection('user').doc(uid).set(
    {
      email,
      name,
      department,
      role,
      active,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    },
    { merge: true }
  );

  if (role === 'admin') {
    await adminDb.collection('admin').doc(uid).set(
      {
        email,
        name,
        active,
        role,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actorUid,
      },
      { merge: true }
    );
  } else {
    await adminDb.collection('admin').doc(uid).delete().catch(() => undefined);
  }

  if (setClaims) {
    await adminAuth.setCustomUserClaims(uid, { role });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await getAdminClients();
    const actorUid = await ensureAdminRequest(request);
    const body = (await request.json()) as Record<string, unknown>;

    const uid = normalizeString(body.uid);
    const name = normalizeString(body.name);
    const email = normalizeString(body.email);
    const department = normalizeString(body.department);
    const password = normalizeString(body.password);
    const role = body.role;
    const active = body.active !== false;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (!isRole(role)) {
      return NextResponse.json({ error: 'Role must be admin or employee.' }, { status: 400 });
    }

    const createdUser = await adminAuth.createUser({
      uid: uid || undefined,
      email,
      password,
      displayName: name || undefined,
      disabled: !active,
    });

    await upsertRoleDocuments({
      adminAuth,
      adminDb,
      uid: createdUser.uid,
      role,
      email,
      name,
      active,
      department,
      actorUid,
    });

    await adminDb.collection('user').doc(createdUser.uid).set(
      {
        createdAt: FieldValue.serverTimestamp(),
        createdBy: actorUid,
      },
      { merge: true }
    );

    return NextResponse.json({ uid: createdUser.uid }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await getAdminClients();
    const actorUid = await ensureAdminRequest(request);
    const body = (await request.json()) as Record<string, unknown>;

    const uid = normalizeString(body.uid);
    const name = normalizeString(body.name);
    const email = normalizeString(body.email);
    const department = normalizeString(body.department);
    const password = normalizeString(body.password);
    const role = body.role;
    const active = body.active !== false;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!isRole(role)) {
      return NextResponse.json({ error: 'Role must be admin or employee.' }, { status: 400 });
    }

    let authUserExists = true;

    try {
      await adminAuth.updateUser(uid, {
        email,
        displayName: name || undefined,
        disabled: !active,
        ...(password ? { password } : {}),
      });
    } catch (error) {
      if (hasAuthCode(error, 'auth/user-not-found')) {
        if (password && password.length >= 6) {
          await adminAuth.createUser({
            uid,
            email,
            password,
            displayName: name || undefined,
            disabled: !active,
          });
        } else {
          authUserExists = false;
        }
      } else {
        throw error;
      }
    }

    if (!authUserExists && role === 'admin') {
      return NextResponse.json(
        { error: 'This user has no Firebase Auth account. Enter a password to create login access before assigning admin role.' },
        { status: 400 }
      );
    }

    await upsertRoleDocuments({
      adminAuth,
      adminDb,
      uid,
      role,
      email,
      name,
      active,
      department,
      actorUid,
      setClaims: authUserExists,
    });

    return NextResponse.json({ uid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await getAdminClients();
    await ensureAdminRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const uid = normalizeString(body.uid);

    if (!uid) {
      return NextResponse.json({ error: 'UID is required.' }, { status: 400 });
    }

    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if (!hasAuthCode(error, 'auth/user-not-found')) {
        throw error;
      }
    }
    await adminDb.collection('user').doc(uid).delete().catch(() => undefined);
    await adminDb.collection('admin').doc(uid).delete().catch(() => undefined);

    return NextResponse.json({ uid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { adminDb } = await getAdminClients();
    await ensureAdminRequest(request);

    const snapshot = await adminDb.collection('user').get();
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
