// Firebase Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '../types';

export const authService = {
    // Sign up new user
    signUp: async (email: string, password: string, name: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update profile with display name
            await updateProfile(firebaseUser, {
                displayName: name
            });

            return {
                id: firebaseUser.uid,
                name: name,
                email: firebaseUser.email || email,
                isAuthenticated: true
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign up');
        }
    },

    // Sign in existing user
    signIn: async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            return {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || email,
                isAuthenticated: true
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    },

    // Sign out
    signOut: async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    },

    // Subscribe to auth state changes
    onAuthStateChange: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const user: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    isAuthenticated: true
                };
                callback(user);
            } else {
                callback(null);
            }
        });
    },

    // Get current user
    getCurrentUser: (): User | null => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            return {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                isAuthenticated: true
            };
        }
        return null;
    }
};
