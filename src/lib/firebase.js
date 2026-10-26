import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAkfGYSD6bfjQKkdDHFta2qft1BUBnZhs0",
    authDomain: "testu-bbb08.firebaseapp.com",
    projectId: "testu-bbb08",
    storageBucket: "testu-bbb08.firebasestorage.app",
    messagingSenderId: "653028067719",
    appId: "1:653028067719:web:083a3cc3620b67bd07eb22"
  };

  const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Создаёт пользователя во вторичном приложении, чтобы НЕ разлогинить текущего.
export async function createUserWithoutLoggingOut(email, password) {
  const secondary = initializeApp(firebaseConfig, "creator-" + Date.now());
  const secondaryAuth = getAuth(secondary);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await signOut(secondaryAuth);
    return cred.user.uid;
  } finally {
    await deleteApp(secondary);
  }
}