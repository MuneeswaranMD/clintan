// Firebase Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '../types';

const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'clintan@averqon.in', 'whatnew.live@gmail.com'];

const getRoleByEmail = (email: string | null): User['role'] => {
    if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
        return 'SUPER_ADMIN';
    }
    return 'COMPANY_ADMIN';
};

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
                isAuthenticated: true,
                role: getRoleByEmail(firebaseUser.email || email)
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
                isAuthenticated: true,
                role: getRoleByEmail(firebaseUser.email || email)
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    },

    // Google Sign in
    signInWithGoogle: async (): Promise<User> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            return {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                isAuthenticated: true,
                role: getRoleByEmail(firebaseUser.email)
            };
        } catch (error: any) {
            throw new Error(error.message || 'Google sign in failed');
        }
    },

    // Facebook Sign in
    signInWithFacebook: async (): Promise<User> => {
        try {
            const provider = new FacebookAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            return {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                isAuthenticated: true,
                role: getRoleByEmail(firebaseUser.email)
            };
        } catch (error: any) {
            throw new Error(error.message || 'Facebook sign in failed');
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
                    isAuthenticated: true,
                    role: getRoleByEmail(firebaseUser.email)
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
                isAuthenticated: true,
                role: getRoleByEmail(firebaseUser.email)
            };
        }
        return null;
    },

    getToken: async (): Promise<string | null> => {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }
};


