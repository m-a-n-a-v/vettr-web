'use client';

/**
 * usePushNotifications
 *
 * Registers the device for Firebase Cloud Messaging push notifications
 * when the user is authenticated.  Handles:
 *
 * 1. Browser support detection (Notification API + service workers)
 * 2. Permission request
 * 3. FCM token retrieval
 * 4. Backend device registration via POST /devices/register
 * 5. Foreground message handling (shows a toast)
 *
 * The hook is idempotent — it only registers once per page session
 * (tracked via a ref) and silently no-ops when push is unsupported
 * or the user denies the permission prompt.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getMessagingInstance, getToken, onMessage } from '@/lib/firebase';
import { api } from '@/lib/api-client';

// VAPID key for Firebase web push — set in .env as NEXT_PUBLIC_FIREBASE_VAPID_KEY
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build the service worker URL with Firebase config injected as query params. */
function buildSwUrl(): string {
  const params = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

/** Register the Firebase messaging service worker if not already registered. */
async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  const swUrl = buildSwUrl();

  // Check if the Firebase SW is already registered
  const registrations = await navigator.serviceWorker.getRegistrations();
  const existing = registrations.find((r) =>
    r.active?.scriptURL.includes('firebase-messaging-sw.js')
  );
  if (existing) return existing;

  try {
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/firebase-cloud-messaging-push-scope',
    });
    // Wait until the SW is active
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('[Push] Service worker registration failed:', err);
    return null;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const registeredRef = useRef(false);

  /**
   * Core registration flow:
   *  permission -> SW -> FCM token -> backend POST /devices/register
   */
  const register = useCallback(async () => {
    try {
      // 1. Check browser support
      if (typeof window === 'undefined') return;
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.warn('[Push] Browser does not support push notifications');
        return;
      }

      // 2. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.info('[Push] Notification permission denied or dismissed');
        return;
      }

      // 3. Get the Firebase Messaging instance
      const messaging = await getMessagingInstance();
      if (!messaging) {
        console.warn('[Push] Firebase Messaging not supported in this browser');
        return;
      }

      // 4. Register the Firebase messaging service worker
      const swRegistration = await ensureServiceWorker();
      if (!swRegistration) {
        console.warn('[Push] Could not register Firebase messaging service worker');
        return;
      }

      // 5. Get the FCM device token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        console.warn('[Push] Failed to retrieve FCM token');
        return;
      }

      // 6. Register the device token with the VETTR backend
      const response = await api.post('/devices/register', {
        token,
        platform: 'web',
      });

      if (!response.success) {
        console.error('[Push] Backend device registration failed:', response.error);
        return;
      }

      console.info('[Push] Device registered for push notifications');

      // 7. Listen for foreground messages and show toast
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || 'VETTR';
        const body = payload.notification?.body || '';

        showToast(`${title}${body ? ` — ${body}` : ''}`, 'info', 6000);
      });

      registeredRef.current = true;
    } catch (err) {
      // Swallow errors gracefully — push is non-critical
      console.error('[Push] Registration error:', err);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) return;
    register();
  }, [isAuthenticated, register]);
}
