import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
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
  console.error('Service worker installation failed:', errorMessage.replace(/[\r\n]/g, ' '));
}
