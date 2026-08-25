import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let adminApp: App;

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

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
