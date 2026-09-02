'use client';

import { useEffect } from 'react';

// Registers the Firebase Messaging service worker once per app load.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((error) => {
        console.error('Service worker registration failed', error);
      });
    }
  }, []);

  return null;
}
