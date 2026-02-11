import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserSettings {
    n8nWebhookUrl?: string;
    razorpayKey?: string;
    whatsappPhoneId?: string;
    whatsappToken?: string;
    emailFrom?: string;
}

const SETTINGS_COLLECTION = 'settings';

export const settingsService = {
    getSettings: async (userId: string): Promise<UserSettings | null> => {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as UserSettings;
            }
            return null;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    saveSettings: async (userId: string, settings: UserSettings): Promise<void> => {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, userId);
            await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
};
