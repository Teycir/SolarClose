'use client';

import { useEffect } from 'react';

const CACHE_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || 'v4';

export function ServiceWorkerManager() {
  useEffect(() => {
    const clearAll = async () => {
      const currentVersion = sessionStorage.getItem('cache-version');
      
      if (currentVersion !== CACHE_VERSION) {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          
          const names = await caches.keys();
          for (const name of names) {
            await caches.delete(name);
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
    };
    
    clearAll();
  }, []);

  return null;
}
