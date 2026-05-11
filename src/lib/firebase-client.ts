import { initializeApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA69ohkJWLtk5O7grTKGvwfNcvZ2ZA-LMA',
  authDomain: 'kofekodocs.firebaseapp.com',
  projectId: 'kofekodocs',
  storageBucket: 'kofekodocs.firebasestorage.app',
  messagingSenderId: '873634667629',
  appId: '1:873634667629:web:d3775bc8d74aeb0f527364',
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

