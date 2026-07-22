import { initializeApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFK1EBIxOTKjKoYI-JaJSjYl23cc0gQQQ",
  authDomain: "kofeko-ce167.firebaseapp.com",
  projectId: "kofeko-ce167",
  storageBucket: "kofeko-ce167.firebasestorage.app",
  messagingSenderId: "385956436121",
  appId: "1:385956436121:web:4851707df867aefaeb0008"
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

