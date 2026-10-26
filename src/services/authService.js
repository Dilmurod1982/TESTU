import { auth, db, googleProvider } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

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

// Смена пароля с повторной аутентификацией
export async function changePassword({ currentPassword, newPassword }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Пользователь не авторизован");
  if (!user.email) throw new Error("У аккаунта нет email (вход через Google/Apple)");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}