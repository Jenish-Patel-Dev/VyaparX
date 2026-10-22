import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDH3lojdNO887tENPc68JMYvTS5paxnoPc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vyaparx-610fe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vyaparx-610fe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vyaparx-610fe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "466142431180",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:466142431180:web:cdfa2c56f909cb5ce53f69",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PT6QCL0V52"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
