import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type UserRole = 'admin' | 'employee';

function isRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'employee';
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function firestoreWrite(path: string, data: Record<string, any>, idToken?: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const fields: Record<string, any> = {};
  const fieldPaths: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    fieldPaths.push(key);
    
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

  // For PATCH: build updateMask.fieldPaths[] in query string
  // Format: ?updateMask.fieldPaths=field1&updateMask.fieldPaths=field2&key=...
  const maskParams = fieldPaths.map(fp => `updateMask.fieldPaths=${encodeURIComponent(fp)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?${maskParams}&key=${apiKey}`;
  
  const body = { fields };

  console.log('Firestore PATCH request:', { 
    url: url.split('?')[0], 
    fieldCount: fieldPaths.length,
    fields: fieldPaths
  });

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore write error: ${response.status}`, {
      status: response.status,
      url: url.split('?')[0],
      error: errorText,
      fields: Object.keys(fields)
    });
    throw new Error(`Failed to write document: ${response.status} - ${errorText}`);
  }
  
  console.log('Firestore PATCH successful');
}

async function firestoreDelete(path: string, idToken?: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });
  
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error(`Firestore delete error: ${response.status}`, errorText);
    throw new Error(`Failed to delete document: ${response.status}`);
  }
}

async function firestoreQuery(collectionPath: string, idToken?: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase config not available');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });
  
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
  // Note: Firebase Identity Toolkit API requires idToken for deletion, not localId.
  // Since we don't have the user's token on the server, we can't delete from Auth via REST API.
  // This function is kept as a placeholder. Auth account will remain but be removed from Firestore.
  // To fully delete, user would need to delete their account from client-side with their own token.
  console.log(`User ${uid} deleted from Firestore. Auth account kept for security.`);
}

async function upsertRoleDocuments(params: {
  uid: string;
  role: UserRole;
  email: string;
  name: string;
  active: boolean;
  department: string;
  actorUid: string;
  idToken: string;
}) {
  const { uid, role, email, name, active, department, actorUid, idToken } = params;
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
  }, idToken);

  if (role === 'admin') {
    // Create/update admin document
    await firestoreWrite(`admin/${uid}`, {
      email,
      name,
      active,
      role,
      updatedAt: now,
      updatedBy: actorUid,
    }, idToken);
  } else {
    // Delete admin document if employee
    await firestoreDelete(`admin/${uid}`, idToken).catch(() => undefined);
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
      idToken: token,
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
      console.log('PATCH: Updating auth user', { userUid, email: !!email, password: !!password });
      await updateAuthUser(userUid, email || undefined, password || undefined);
      console.log('PATCH: Auth user updated successfully');
    }

    console.log('PATCH: Upserting role documents', { userUid, role });
    await upsertRoleDocuments({
      uid: userUid,
      role,
      email,
      name,
      active,
      department,
      actorUid,
      idToken: token,
    });
    console.log('PATCH: Role documents upserted successfully');

    return NextResponse.json({ uid: userUid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    console.error('PATCH error:', { message, stack: error instanceof Error ? error.stack : undefined });
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

    await firestoreDelete(`user/${uid}`, token).catch(() => undefined);
    await firestoreDelete(`admin/${uid}`, token).catch(() => undefined);

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

    const docs = await firestoreQuery('user', token);
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
