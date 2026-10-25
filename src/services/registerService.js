import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function registerStudent({
  email, password, firstName, lastName, middleName, phone, universityId, groupId,
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, "users", uid), {
    role: "student",
    email,
    firstName,
    lastName,
    middleName: middleName || "",
    phone: phone || "",
    universityId,
    groupId,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}