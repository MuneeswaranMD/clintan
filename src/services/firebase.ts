// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB4HRJLeJPCWVZaBX-vctNpS5guD_Moo0Q",
    authDomain: "clintan.firebaseapp.com",
    projectId: "clintan",
    storageBucket: "clintan.firebasestorage.app",
    messagingSenderId: "120474786500",
    appId: "1:120474786500:web:bebfccb869f3e04febc791",
    measurementId: "G-WSCRWECPR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances
export { auth, db, firebaseConfig };
