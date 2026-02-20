import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings } from '../types';

const SETTINGS_COLLECTION = 'settings';

export const settingsService = {
    getSettings: async (userId: string): Promise<Settings | null> => {
        try {
            console.log('Fetching settings for user:', userId);
            const docRef = doc(db, SETTINGS_COLLECTION, userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const settings = docSnap.data() as Settings;

                // Attempt to fetch API Key via Backend API
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const token = await user.getIdToken();

                        // Use Environment Variable or fallback
                        const apiBase = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ||
                            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                                ? 'http://127.0.0.1:5001'
                                : 'https://averqonbill.onrender.com');

                        console.log('Fetching API Key from:', `${apiBase}/api/keys`);

                        const response = await fetch(`${apiBase}/api/keys`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.apiKey) {
                                settings.apiKey = data.apiKey;
                            }
                        } else {
                            console.warn('API Key fetch returned status:', response.status);
                        }
                    }
                } catch (apiError) {
                    console.warn("API Key lookup failed (non-critical):", apiError);
                }

                return settings;
            }
            return null;
        } catch (error) {
            console.error('CRITICAL: Error getting settings:', error);
            return null;
        }
    },

    saveSettings: async (userId: string, settings: Partial<Settings>): Promise<void> => {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, userId);
            await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    generateApiKey: async (): Promise<string> => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not authenticated");

        try {
            const token = await user.getIdToken();

            // Use Environment Variable or fallback
            const apiBase = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ||
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://127.0.0.1:5001'
                    : 'https://averqonbill.onrender.com');

            console.log('Generating API Key via:', `${apiBase}/api/keys/generate`);

            const response = await fetch(`${apiBase}/api/keys/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to generate key');
            return data.apiKey;
        } catch (error: any) {
            console.error("API Key Generation Failed:", error);
            throw new Error(error.message);
        }
    }
};
