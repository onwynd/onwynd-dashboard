
// filepath: app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/use-toast";
import { DashboardIPProtectionProvider } from "@/providers/IPProtectionProvider";
import { BrandThemeProvider } from "@/components/shared/brand-theme-provider";
import { PwaInit } from "@/components/shared/pwa-init";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Onwynd",
    default: "Onwynd — Mental Health Platform",
  },
  description: "Hybrid mental health platform connecting patients with providers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Onwynd",
  },
  icons: {
    shortcut: "/icons/favicon.ico",
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96x96.png",    sizes: "96x96",  type: "image/png" },
      { url: "/icons/icon-192x192.png",  sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png",  sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-57x57.png",   sizes: "57x57" },
      { url: "/icons/apple-touch-icon-60x60.png",   sizes: "60x60" },
      { url: "/icons/apple-touch-icon-72x72.png",   sizes: "72x72" },
      { url: "/icons/apple-touch-icon-76x76.png",   sizes: "76x76" },
      { url: "/icons/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/icons/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/icons/apple-touch-icon-144x144.png", sizes: "144x144" },
      { url: "/icons/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Onwynd - Mental Health Platform",
    description: "Hybrid mental health platform connecting patients with providers.",
    images: [{ url: "/icons/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/icons/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <DashboardIPProtectionProvider>
                  <BrandThemeProvider>
                    <ToastProvider>
                      {children}
                      <PwaInit />
                    </ToastProvider>
                  </BrandThemeProvider>
                </DashboardIPProtectionProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
