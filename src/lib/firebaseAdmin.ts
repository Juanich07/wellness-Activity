import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type App = any;

let adminApp: App | null = null;
let initError: Error | null = null;
let authInstance: any = null;
let dbInstance: any = null;

function parseServiceAccount(): ServiceAccountShape {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  let source = raw;

  if (!source && path) {
    const candidatePaths = isAbsolute(path)
      ? [path]
      : [
          resolve(process.cwd(), path),
          resolve(process.cwd(), 'wellness-Activity', path),
          join(process.cwd(), path),
        ];

    const existingPath = candidatePaths.find((candidate) => existsSync(candidate));

    if (!existingPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH could not be read.');
    }

    try {
      source = readFileSync(existingPath, 'utf8');
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH could not be read.');
    }
  }

  if (!source) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH must be configured.');
  }

  let parsed: ServiceAccountShape;

  try {
    parsed = JSON.parse(source) as ServiceAccountShape;
  } catch {
    throw new Error('Firebase service account value is not valid JSON.');
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields.');
  }

  return {
    ...parsed,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  };
}

async function initializeAdmin(): Promise<void> {
  if (initError) {
    throw initError;
  }

  if (adminApp) {
    return;
  }

  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      const serviceAccount = parseServiceAccount();

      adminApp = initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      });
    } else {
      adminApp = getApps()[0] as App;
    }

    authInstance = getAuth(adminApp);
    dbInstance = getFirestore(adminApp);
  } catch (error) {
    initError = error instanceof Error ? error : new Error('Unknown initialization error');
    console.error('Firebase Admin initialization error:', initError);
    throw initError;
  }
}

export async function getAdminAuth() {
  await initializeAdmin();
  if (!authInstance) {
    throw new Error('Firebase Admin Auth not initialized');
  }
  return authInstance;
}

export async function getAdminDb() {
  await initializeAdmin();
  if (!dbInstance) {
    throw new Error('Firebase Admin Firestore not initialized');
  }
  return dbInstance;
}
