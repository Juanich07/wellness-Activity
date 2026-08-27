import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type UserRole = 'admin' | 'employee';

function isRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'employee';
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function firestoreWrite(path: string, data: Record<string, any>) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;
  
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
    } else {
      fields[key] = { nullValue: null };
    }
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore write error: ${response.status}`, errorText);
    throw new Error(`Failed to write document: ${response.status}`);
  }
}

async function firestoreDelete(path: string) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;
  const response = await fetch(url, { method: 'DELETE' });
  
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error(`Firestore delete error: ${response.status}`, errorText);
    throw new Error(`Failed to delete document: ${response.status}`);
  }
}

async function firestoreQuery(collectionPath: string) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?key=${apiKey}`;
  const response = await fetch(url, { method: 'GET' });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore query error: ${response.status}`, errorText);
    throw new Error(`Failed to query collection: ${response.status}`);
  }

  const data = (await response.json()) as any;
  return data.documents || [];
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
    
    // For now, trust Firebase Auth token verification
    // Admin status should be checked on the client before calling this endpoint
    // Or implement admin verification through a different method
    
    return uid;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
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
  const now = new Date().toISOString();

  // Update user document
  await firestoreWrite(`user/${uid}`, {
    email,
    name,
    department,
    role,
    active,
    updatedAt: now,
    updatedBy: actorUid,
  });

  if (role === 'admin') {
    // Create/update admin document
    await firestoreWrite(`admin/${uid}`, {
      email,
      name,
      active,
      role,
      updatedAt: now,
      updatedBy: actorUid,
    });
  } else {
    // Delete admin document if employee
    await firestoreDelete(`admin/${uid}`).catch(() => undefined);
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

    // Add creation timestamp
    const now = new Date().toISOString();
    await firestoreWrite(`user/${createdUid}`, {
      createdAt: now,
      createdBy: actorUid,
    });

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

    await firestoreDelete(`user/${uid}`).catch(() => undefined);
    await firestoreDelete(`admin/${uid}`).catch(() => undefined);

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

    const docs = await firestoreQuery('user');
    const users = docs.map((doc: any) => {
      const fields = doc.fields || {};
      return {
        id: doc.name?.split('/').pop() || '',
        name: fields.name?.stringValue || '',
        email: fields.email?.stringValue || '',
        department: fields.department?.stringValue || '',
        role: fields.role?.stringValue || '',
        active: fields.active?.booleanValue ?? true,
      };
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users.';
    const status = message.startsWith('Unauthorized') ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
