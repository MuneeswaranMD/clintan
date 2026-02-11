import { initializeApp as initApp, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { firebaseConfig, db } from './firebase';

// Helper to interact with a secondary app instance
// so we don't log out the main user.
const getSecondaryAuth = () => {
    const appName = 'secondary';
    let app;
    try {
        app = getApp(appName);
    } catch (e) {
        app = initApp(firebaseConfig, appName);
    }
    return getAuth(app);
};

export const companyService = {
    // Create a new company (Provider/User) account
    createCompany: async (name: string, email: string) => {
        // Generate a temporary password or let admin set it.
        // For now, let's allow setting it or default.
        // Since this is admin usage, we should probably ask for password.
        // BUT to keep interface simple, I'll ask for it in the UI.
        throw new Error("Password required");
    },

    createCompanyWithPassword: async (name: string, email: string, password: string, logoUrl: string = '', phone: string = '') => {
        const auth2 = getSecondaryAuth();

        // Create the user in Auth
        const userCredential = await createUserWithEmailAndPassword(auth2, email, password);
        const user = userCredential.user;

        // Update their profile
        // Note: photoURL is standard in Firebase Auth
        await updateProfile(user, { displayName: name, photoURL: logoUrl });

        // Store additional company metadata in Firestore 'companies' collection
        // This allows us to list them later
        await addDoc(collection(db, 'companies'), {
            userId: user.uid,
            name: name,
            email: email,
            phone: phone,
            logoUrl: logoUrl,
            createdAt: serverTimestamp(),
            createdBy: 'SuperAdmin' // or current user ID if passed
        });

        return user;
    },

    // Get company details by User ID
    getCompanyByUserId: async (uid: string) => {
        const q = query(collection(db, 'companies'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    // List all companies
    getAllCompanies: async () => {
        const snapshot = await getDocs(collection(db, 'companies'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Update company details
    updateCompany: async (id: string, data: any) => {
        const { doc, updateDoc } = await import('firebase/firestore');
        const companyRef = doc(db, 'companies', id);
        await updateDoc(companyRef, data);
    }
};
