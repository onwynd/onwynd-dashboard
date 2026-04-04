import type { NextConfig } from "next";

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

export default nextConfig;
