/**
 * Firebase Client SDK — Web Push Notifications
 *
 * Initializes the Firebase app (client-side only) and exposes a lazy
 * getter for the Cloud Messaging instance.  The messaging instance is
 * created on first access so the module can be safely imported in SSR
 * contexts without throwing.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client side
const app =
  typeof window !== 'undefined' && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0] ?? null;

let messagingInstance: Messaging | null = null;

/**
 * Returns the Firebase Messaging instance, or `null` when:
 * - Running on the server (SSR)
 * - The browser does not support the Push API / service workers
 * - Firebase app failed to initialise (e.g. missing env vars)
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  if (messagingInstance) return messagingInstance;

  const supported = await isSupported();
  if (!supported || !app) return null;

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export { app, getToken, onMessage };
