import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare global {
  interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
  }

  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
  }
}

declare const self: WorkerGlobalScope;

try {
  installSerwist({
    precacheEntries: self.__SW_MANIFEST || [],
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
  });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error('Service worker installation failed:', errorMessage.replace(/[\r\n]/g, ' '));
  if (errorStack) {
    console.error('Stack trace:', errorStack.replace(/[\r\n]/g, ' | '));
  }
  self.addEventListener('fetch', (event: FetchEvent) => {
    try {
      event.respondWith(fetch(event.request));
    } catch (fetchError) {
      const fetchErrorMsg = fetchError instanceof Error ? fetchError.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
      console.error('Fetch failed:', fetchErrorMsg);
    }
  });
}
