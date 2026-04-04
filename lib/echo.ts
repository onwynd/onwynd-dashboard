/**
 * Laravel Echo singleton (Reverb / Pusher-compatible).
 *
 * Lazily initialised so it only runs in the browser, never during SSR.
 * Auth token is read from localStorage at connect time.
 */

import Echo from 'laravel-echo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: Echo<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(): Echo<any> | null {
  if (typeof window === 'undefined') return null;

  if (echoInstance) return echoInstance;

  // Dynamic import so Next.js SSR doesn't choke on window references
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const LaravelEcho = require('laravel-echo');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Pusher = require('pusher-js');
  (window as unknown as Record<string, unknown>).Pusher = Pusher;

  const token = localStorage.getItem('auth_token') ?? '';

  echoInstance = new LaravelEcho({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? '',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

/** Disconnect and reset the singleton (call on logout) */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect?.();
    echoInstance = null;
  }
}
