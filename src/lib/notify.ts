// Some mobile browsers (e.g. Android Chrome) block `new Notification()` and require
// showing notifications through an active service worker registration instead.
export async function safeNotify(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, options);
    return;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      console.error('Failed to show notification', error);
      return;
    }
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('No active service worker')), 4000)),
      ]);
      await registration.showNotification(title, options);
    }
  } catch (error) {
    console.error('Failed to show notification via service worker', error);
  }
}
