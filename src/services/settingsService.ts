import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Settings } from '../types';

const SETTINGS_COLLECTION = 'settings';

export const settingsService = {
    getSettings: async (userId: string): Promise<Settings | null> => {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as Settings;
            }
            return null;
        } catch (error) {
            console.error('Error fetching settings:', error);
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
    }
};
