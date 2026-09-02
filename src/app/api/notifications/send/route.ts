import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

type NotificationRequest = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
};

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json() as NotificationRequest;
    const title = text(requestBody.title, 'Wellness activity time');
    const body = text(requestBody.body, 'Take a few minutes for your scheduled wellness activity.');
    const url = text(requestBody.url, '/dashboard');
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
    return NextResponse.json({ ok: true, sent, recipients: recipients.length });
  } catch (error) {
    console.error('Failed to send wellness notifications', error);
    return NextResponse.json({ error: 'Unable to send notifications.' }, { status: 500 });
  }
}