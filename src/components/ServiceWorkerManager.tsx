'use client';

import { useEffect } from 'react';

export function ServiceWorkerManager() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registration.update();
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
