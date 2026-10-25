import { auth, db, googleProvider } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

// Создаёт профиль студента при первом входе через Google/Apple
export async function ensureStudentProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const displayName = user.displayName || "";
  const parts = displayName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const profile = {
    role: "student",
    email: user.email || "",
    firstName,
    lastName,
    middleName: "",
    phone: "",
    universityId: null,
    groupId: null,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return profile;
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      callback(user, profile);
    } catch (err) {
      console.error("getUserProfile error:", err);
      callback(user, null);
    }
  });
}