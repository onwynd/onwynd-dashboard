"use client";

import { useEffect, useRef, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function usePushNotifications() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isReady, setIsReady] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const registerToken = async (token: string) => {
    try {
      await client.post('/api/v1/notifications/subscribe', { token });
    } catch {
      // Silently fail — token registration is best-effort
    }
  };

  const requestPermissionAndSubscribe = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    setPermissionState(permission);

    if (permission !== 'granted') return;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    try {
      const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);
      if (token) {
        setFcmToken(token);
        await registerToken(token);
      }
    } catch {
      // Token retrieval failed (e.g., SW not registered yet)
    }

    // Listen for foreground messages
    unsubscribeRef.current = onMessage(messaging, (payload) => {
      const notification = payload.notification as PushNotification | undefined;
      if (notification) {
        toast(notification.title ?? 'New notification', {
          description: notification.body,
        });
      }
    });

    setIsReady(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPermissionState(Notification.permission);
    if (Notification.permission === 'granted') {
      requestPermissionAndSubscribe();
    }
    return () => {
      unsubscribeRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    fcmToken,
    permissionState,
    isReady,
    requestPermission: requestPermissionAndSubscribe,
  };
}
