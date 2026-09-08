import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

type NotificationRequest = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
};

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

async function isAdminBearerToken(bearerToken: string | undefined) {
  if (!bearerToken) {
    return false;
  }

  try {
    const adminAuth = await getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(bearerToken);
    if ((decoded as { role?: string }).role === 'admin') {
      return true;
    }

    const adminDb = await getAdminDb();
    const adminDoc = await adminDb.collection('admin').doc(decoded.uid).get();
    return adminDoc.exists && adminDoc.get('active') === true;
  } catch (error) {
    console.error('Failed to verify admin token for manual send', error);
    return false;
  }
}

// Allows either the scheduler's CRON_SECRET or a signed-in admin's Firebase ID token to trigger a send.
async function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (secret && (request.headers.get('x-cron-secret') === secret || bearerToken === secret)) {
    return true;
  }

  return isAdminBearerToken(bearerToken);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

async function sendNotificationBatch(title: string, body: string, url: string) {
  const adminDb = await getAdminDb();
  const tokenDocuments = await adminDb.collectionGroup('pushTokens').get();
  const recipients = tokenDocuments.docs
    .map((document: any) => ({ document, token: document.get('token') as string }))
    .filter(({ token }: { token: string }) => Boolean(token));

  const { getMessaging } = await import('firebase-admin/messaging');
  let sent = 0;
  for (let index = 0; index < recipients.length; index += 500) {
    const batch = recipients.slice(index, index + 500);
    const result = await getMessaging().sendEachForMulticast({
      tokens: batch.map(({ token }: { token: string }) => token),
      data: { title, body, url },
      webpush: { fcmOptions: { link: url } },
    });
    sent += result.successCount;
    await Promise.all(result.responses.map((response: any, responseIndex: number) => {
      const code = response.error?.code as string | undefined;
      return !response.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')
        ? batch[responseIndex].document.ref.delete()
        : Promise.resolve();
    }));
  }

  return { recipients: recipients.length, sent };
}

async function sendEmailReminders(title: string, body: string, url: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) {
    return { configured: false, recipients: 0, sent: 0 };
  }

  const adminDb = await getAdminDb();
  const userDocuments = await adminDb.collection('user').where('active', '==', true).get();
  const emailAddresses: string[] = [...new Set<string>(userDocuments.docs
    .map((document: any) => String(document.get('email') ?? '').trim())
    .filter((email: string) => Boolean(email)))];
  const appUrl = new URL(url, process.env.APP_URL ?? 'http://localhost:3000').toString();
  const from = process.env.EMAIL_FROM || `Wellness App <${gmailUser}>`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  let sent = 0;
  let lastError: string | undefined;
  const CONCURRENCY = 5;

  for (let index = 0; index < emailAddresses.length; index += CONCURRENCY) {
    const batch = emailAddresses.slice(index, index + CONCURRENCY);
    const results = await Promise.allSettled(batch.map((email) => transporter.sendMail({
      from,
      to: email,
      subject: title,
      html: `<p>${escapeHtml(body)}</p><p><a href="${appUrl}">Open your wellness schedule</a></p>`,
    })));

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sent += 1;
      } else {
        lastError = result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error('Gmail SMTP rejected an email reminder', result.reason);
      }
    }
  }

  return { configured: true, recipients: emailAddresses.length, sent, ...(lastError ? { error: lastError } : {}) };
}

async function sendReminders(title: string, body: string, url: string) {
  const [push, email] = await Promise.all([
    sendNotificationBatch(title, body, url),
    sendEmailReminders(title, body, url),
  ]);
  return { push, email };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json() as NotificationRequest;
    const title = text(requestBody.title, 'Wellness activity time');
    const body = text(requestBody.body, 'Take a few minutes for your scheduled wellness activity.');
    const url = text(requestBody.url, '/dashboard');
    return NextResponse.json({ ok: true, ...(await sendReminders(title, body, url)) });
  } catch (error) {
    console.error('Failed to send wellness notifications', error);
    return NextResponse.json({ error: 'Unable to send notifications.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slot = request.nextUrl.searchParams.get('slot');
  const reminders: Record<string, { title: string; body: string }> = {
    morning: { title: '9:00 AM wellness reminder', body: 'Your morning wellness activity is ready.' },
    midday: { title: '12:00 PM wellness reminder', body: 'It is time for your midday wellness activity.' },
    afternoon: { title: '3:00 PM wellness reminder', body: 'Your afternoon wellness activity is ready.' },
  };
  const reminder = reminders[slot ?? ''];
  if (!reminder) {
    return NextResponse.json({ error: 'A valid schedule slot is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, slot, ...(await sendReminders(reminder.title, reminder.body, '/dashboard')) });
  } catch (error) {
    console.error('Failed to send wellness notifications', error);
    return NextResponse.json({ error: 'Unable to send notifications.' }, { status: 500 });
  }
}