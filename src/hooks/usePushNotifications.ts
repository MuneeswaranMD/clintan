import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { authService } from '../services/authService';

// Firebase Cloud Messaging configuration
const VAPID_KEY = 'BNdusPHJe2ERe-L_qFGerydZXOchtB32YECw6vYFMqhFXP512HLvMljGPaganrKGLmQrNDCfxxLVRqkpsuVIVPU';

interface PushSubscriptionState {
    isSupported: boolean;
    isSubscribed: boolean;
    token: string | null;
    permission: NotificationPermission;
    error: string | null;
}

export const usePushNotifications = () => {
    const [state, setState] = useState<PushSubscriptionState>({
        isSupported: false,
        isSubscribed: false,
        token: null,
        permission: 'default',
        error: null
    });

    useEffect(() => {
        // Check if push notifications are supported
        const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'denied'
        }));

        if (!isSupported) {
            console.warn('Push notifications are not supported in this browser');
            return;
        }

        // Register service worker
        registerServiceWorker();

        // Check if already subscribed
        if (Notification.permission === 'granted') {
            initializeMessaging();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('Service Worker registered:', registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to register service worker'
            }));
        }
    };

    const initializeMessaging = async () => {
        try {
            const messaging = getMessaging();

            // Get FCM token
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: await navigator.serviceWorker.ready
            });

            if (currentToken) {
                console.log('FCM Token:', currentToken);

                // Save token to database
                await savePushToken(currentToken);

                setState(prev => ({
                    ...prev,
                    isSubscribed: true,
                    token: currentToken
                }));

                // Listen for foreground messages
                onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);

                    // Show notification even when app is in foreground
                    if (payload.notification) {
                        new Notification(payload.notification.title || 'Notification', {
                            body: payload.notification.body,
                            icon: payload.notification.icon || '/icon-192.png',
                            badge: '/icon-192.png'
                        });
                    }
                });

            } else {
                console.log('No registration token available');
                setState(prev => ({
                    ...prev,
                    error: 'Failed to get FCM token'
                }));
            }
        } catch (error) {
            console.error('Error initializing messaging:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to initialize push notifications'
            }));
        }
    };

    const savePushToken = async (token: string) => {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            // Save to Firestore
            const { db } = await import('../services/firebase');
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

            await setDoc(doc(db, 'push_tokens', user.id), {
                userId: user.id,
                fcmToken: token,
                device: navigator.userAgent,
                browser: getBrowserInfo(),
                platform: navigator.platform,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('Push token saved to database');
        } catch (error) {
            console.error('Error saving push token:', error);
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Push notifications are not supported'
            }));
            return false;
        }

        try {
            const permission = await Notification.requestPermission();

            setState(prev => ({
                ...prev,
                permission
            }));

            if (permission === 'granted') {
                await initializeMessaging();
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    error: 'Notification permission denied'
                }));
                return false;
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to request notification permission'
            }));
            return false;
        }
    };

    const unsubscribe = async () => {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            // Remove token from database
            const { db } = await import('../services/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');

            await deleteDoc(doc(db, 'push_tokens', user.id));

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                token: null
            }));

            console.log('Unsubscribed from push notifications');
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    };

    return {
        ...state,
        requestPermission,
        unsubscribe
    };
};

// Helper function to get browser info
function getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';

    if (ua.indexOf('Chrome') > -1) browserName = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browserName = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browserName = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browserName = 'Edge';
    else if (ua.indexOf('Opera') > -1) browserName = 'Opera';

    return browserName;
}
