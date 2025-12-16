'use client';

import { useEffect } from 'react';

const CACHE_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || 'v4';

export function ServiceWorkerManager() {
  useEffect(() => {
    const clearAll = async () => {
      try {
        const currentVersion = sessionStorage.getItem('cache-version');

        if (currentVersion !== CACHE_VERSION) {
          if ('serviceWorker' in navigator) {
            try {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                await registration.unregister();
              }
            } catch (error) {
              console.error('Failed to unregister service workers:', error instanceof Error ? error.message : String(error));
            }

            try {
              const names = await caches.keys();
              for (const name of names) {
                await caches.delete(name);
              }
            } catch (error) {
              console.error('Failed to clear caches:', error instanceof Error ? error.message : String(error));
            }
          }

          sessionStorage.setItem('cache-version', CACHE_VERSION);
          const url = new URL(window.location.href);
          url.searchParams.set('v', Date.now().toString());
          window.location.replace(url.toString());
        } else {
          const url = new URL(window.location.href);
          if (url.searchParams.has('v')) {
            url.searchParams.delete('v');
            window.history.replaceState({}, '', url.pathname + url.search);
          }
        }
      } catch (error) {
        console.error('Service worker manager error:', error instanceof Error ? error.message : String(error));
      }
    };
    
    clearAll().catch((error) => {
      console.error('Failed to execute clearAll:', error instanceof Error ? error.message : String(error));
    });
  }, []);

  return null;
}
