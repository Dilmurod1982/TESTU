import {
    collection, addDoc, getDocs, query, orderBy, serverTimestamp,
    doc, setDoc,
  } from "firebase/firestore";
  import { db } from "../lib/firebase";
  import { createUserWithoutLoggingOut } from "../lib/firebase";
  
  // ---------- Вузы ----------
  export async function createUniversity({ name, shortName }) {
    const ref = await addDoc(collection(db, "universities"), {
      name,
      shortName: shortName || "",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function listUniversities() {
    const q = query(collection(db, "universities"), orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  
  // ---------- Админы ----------
  export async function createAdmin({
    email, password, firstName, lastName, middleName, phone, universityId,
  }) {
    // Создаём Auth-пользователя во вторичном приложении — текущий суперадмин не разлогинится
    const uid = await createUserWithoutLoggingOut(email, password);
  
    // Пишем профиль в Firestore с ID = uid (чтобы совпадало с Auth UID)
    await setDoc(doc(db, "users", uid), {
      role: "admin",
      email,
      firstName,
      lastName,
      middleName: middleName || "",
      phone: phone || "",
      universityId,
      createdAt: serverTimestamp(),
    });
  
    return uid;
  }