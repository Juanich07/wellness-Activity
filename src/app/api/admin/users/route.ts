import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type UserRole = 'admin' | 'employee';

function isRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'employee';
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function getFirestore() {
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getApps, initializeApp, cert } = await import('firebase-admin/app');
  
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY must be configured.');
  }
  
  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error('Firebase service account value is not valid JSON.');
  }
  
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  return getFirestore();
}

async function getFieldValue() {
  const { FieldValue } = await import('firebase-admin/firestore');
  return FieldValue;
}

async function verifyAdminToken(token: string): Promise<string> {
  if (!token) {
    throw new Error('Unauthorized: missing bearer token.');
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    // Use Firebase REST API to verify the token
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    if (!response.ok) {
      throw new Error('Unauthorized: invalid token.');
    }

    const data = (await response.json()) as { users?: Array<{ localId?: string }> };
    if (!data.users?.[0]?.localId) {
      throw new Error('Unauthorized: invalid token.');
    }

    const uid = data.users[0].localId;
    
    // Check if user is admin in Firestore
    const db = await getFirestore();
    const adminDoc = await db.collection('admin').doc(uid).get();
    
    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      throw new Error('Forbidden: admin access required.');
    }

    return uid;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      throw error;
    }
    throw new Error('Unauthorized: token verification failed.');
  }
}

async function createAuthUser(email: string, password: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase API key not configured');
  }

  const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: false,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as any;
    throw new Error(error?.error?.message || 'Failed to create user');
  }

  const data = (await response.json()) as { localId?: string };
  if (!data.localId) {
    throw new Error('Failed to create user');
  }

  return data.localId;
}

async function updateAuthUser(uid: string, email?: string, password?: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase API key not configured');
  }

  const body: any = {};
  if (email) body.email = email;
  if (password) body.password = password;

  const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:update?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, localId: uid, returnSecureToken: false }),
  });

  if (!response.ok) {
    const error = (await response.json()) as any;
    throw new Error(error?.error?.message || 'Failed to update user');
  }
}

async function deleteAuthUser(uid: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase API key not configured');
  }

  const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: uid }),
  });

  if (!response.ok) {
    const error = (await response.json()) as any;
    // Ignore user-not-found errors
    if (!error?.error?.message?.includes('USER_NOT_FOUND')) {
      throw new Error(error?.error?.message || 'Failed to delete user');
    }
  }
}

async function upsertRoleDocuments(params: {
  uid: string;
  role: UserRole;
  email: string;
  name: string;
  active: boolean;
  department: string;
  actorUid: string;
}) {
  const { uid, role, email, name, active, department, actorUid } = params;
  const db = await getFirestore();
  const FieldValue = await getFieldValue();

  await db.collection('user').doc(uid).set(
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
    await db.collection('admin').doc(uid).set(
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
    await db.collection('admin').doc(uid).delete().catch(() => undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: missing bearer token.');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const actorUid = await verifyAdminToken(token);

    const body = (await request.json()) as Record<string, unknown>;

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

    const createdUid = await createAuthUser(email, password);

    await upsertRoleDocuments({
      uid: createdUid,
      role,
      email,
      name,
      active,
      department,
      actorUid,
    });

    const db = await getFirestore();
    const FieldValue = await getFieldValue();
    await db.collection('user').doc(createdUid).set(
      {
        createdAt: FieldValue.serverTimestamp(),
        createdBy: actorUid,
      },
      { merge: true }
    );

    return NextResponse.json({ uid: createdUid }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: missing bearer token.');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const actorUid = await verifyAdminToken(token);

    const body = (await request.json()) as Record<string, unknown>;

    const userUid = normalizeString(body.uid);
    const name = normalizeString(body.name);
    const email = normalizeString(body.email);
    const department = normalizeString(body.department);
    const password = normalizeString(body.password);
    const role = body.role;
    const active = body.active !== false;

    if (!userUid) {
      return NextResponse.json({ error: 'UID is required.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!isRole(role)) {
      return NextResponse.json({ error: 'Role must be admin or employee.' }, { status: 400 });
    }

    if (email || password) {
      await updateAuthUser(userUid, email || undefined, password || undefined);
    }

    await upsertRoleDocuments({
      uid: userUid,
      role,
      email,
      name,
      active,
      department,
      actorUid,
    });

    return NextResponse.json({ uid: userUid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: missing bearer token.');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    await verifyAdminToken(token);

    const body = (await request.json()) as Record<string, unknown>;
    const uid = normalizeString(body.uid);

    if (!uid) {
      return NextResponse.json({ error: 'UID is required.' }, { status: 400 });
    }

    await deleteAuthUser(uid);

    const db = await getFirestore();
    await db.collection('user').doc(uid).delete().catch(() => undefined);
    await db.collection('admin').doc(uid).delete().catch(() => undefined);

    return NextResponse.json({ uid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: missing bearer token.');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    await verifyAdminToken(token);

    const db = await getFirestore();
    const snapshot = await db.collection('user').get();
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
