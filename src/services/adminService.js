import {
    collection, addDoc, getDocs, query, where, serverTimestamp,
    doc, setDoc, deleteDoc,
  } from "firebase/firestore";
  import { db, createUserWithoutLoggingOut } from "../lib/firebase";
  
  // ---------- Кафедры ----------
  export async function listDepartments(universityId) {
    try {
      const q = query(
        collection(db, "departments"),
        where("universityId", "==", universityId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (err) {
      console.error("listDepartments error:", err);
      throw err;
    }
  }
  
  export async function createDepartment({ universityId, name }) {
    const ref = await addDoc(collection(db, "departments"), {
      name,
      universityId,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function deleteDepartment(id) {
    await deleteDoc(doc(db, "departments", id));
  }
  
  // ---------- Предметы ----------
  export async function listSubjects(universityId) {
    try {
      const q = query(
        collection(db, "subjects"),
        where("universityId", "==", universityId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (err) {
      console.error("listSubjects error:", err);
      throw err;
    }
  }
  
  export async function createSubject({ universityId, name, departmentId }) {
    const ref = await addDoc(collection(db, "subjects"), {
      name,
      departmentId: departmentId || null,
      universityId,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function deleteSubject(id) {
    await deleteDoc(doc(db, "subjects", id));
  }
  
  // ---------- Группы ----------
  export async function listGroups(universityId) {
    try {
      const q = query(
        collection(db, "groups"),
        where("universityId", "==", universityId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (err) {
      console.error("listGroups error:", err);
      throw err;
    }
  }
  
  export async function createGroup({ universityId, name, departmentId }) {
    const ref = await addDoc(collection(db, "groups"), {
      name,
      departmentId: departmentId || null,
      universityId,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function deleteGroup(id) {
    await deleteDoc(doc(db, "groups", id));
  }
  
  // ---------- Учителя ----------
  export async function listTeachers(universityId) {
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "teacher"),
        where("universityId", "==", universityId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) =>
        `${a.lastName || ""} ${a.firstName || ""}`.localeCompare(
          `${b.lastName || ""} ${b.firstName || ""}`
        )
      );
    } catch (err) {
      console.error("listTeachers error:", err);
      throw err;
    }
  }
  
  export async function createTeacher({
    universityId, email, password, firstName, lastName, middleName, phone, departmentId,
  }) {
    // Создаём Auth-пользователя во вторичном приложении — текущий админ не разлогинится
    const uid = await createUserWithoutLoggingOut(email, password);
  
    // Профиль с ID = uid (совпадает с Auth UID, иначе учитель не сможет войти)
    await setDoc(doc(db, "users", uid), {
      role: "teacher",
      email,
      firstName,
      lastName,
      middleName: middleName || "",
      phone: phone || "",
      departmentId: departmentId || null,
      universityId,
      createdAt: serverTimestamp(),
    });
  
    return uid;
  }