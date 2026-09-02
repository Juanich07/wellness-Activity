import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import app, { auth } from '@/lib/firebase';
import { safeNotify } from '@/lib/notify';

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
let foregroundListenerStarted = false;

async function getAuthorizationHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

async function saveToken(token: string) {
  const headers = await getAuthorizationHeader();
  if (!headers) {
    return;
  }

  await fetch('/api/notifications/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ token }),
  });
}

function startForegroundListener() {
  if (foregroundListenerStarted) {
    return;
  }

  foregroundListenerStarted = true;
  const messaging = getMessaging(app);
  onMessage(messaging, (payload) => {
    const title = payload.data?.title ?? 'Wellness reminder';
    const body = payload.data?.body ?? '';
    void safeNotify(title, { body, data: { url: payload.data?.url ?? '/' } });
  });
}

export async function registerPushNotifications(): Promise<boolean> {
  if (!auth.currentUser || !vapidKey || !('serviceWorker' in navigator) || !(await isSupported())) {
    return false;
  }

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== 'granted') {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) {
    return false;
  }

  await saveToken(token);
  startForegroundListener();
  return true;
}

export async function unregisterPushNotifications(): Promise<void> {
  if (!vapidKey || !(await isSupported()) || !('serviceWorker' in navigator)) {
    return;
  }

  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: await navigator.serviceWorker.ready });
  if (token) {
    const headers = await getAuthorizationHeader();
    if (headers) {
      await fetch('/api/notifications/token', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ token }),
      });
    }
  }
  await deleteToken(messaging);
}