import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Map the FCM-required root path to the API route that injects env vars.
        // Service workers must be served from the scope they control — root means full-app scope.
        source: '/firebase-messaging-sw.js',
        destination: '/api/firebase-messaging-sw',
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (withPWA as any)({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
