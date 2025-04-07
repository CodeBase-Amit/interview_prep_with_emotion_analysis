
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA4bX2C-G3vJYMHo5iUspr251uhOWMPNPQ",
    authDomain: "prepai-70bb7.firebaseapp.com",
    projectId: "prepai-70bb7",
    storageBucket: "prepai-70bb7.firebasestorage.app",
    messagingSenderId: "877916038939",
    appId: "1:877916038939:web:ade822d24054460b7095be",
    measurementId: "G-EJ2H9SX4CW"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app)