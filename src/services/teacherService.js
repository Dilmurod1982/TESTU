import {
    collection, addDoc, getDocs, query, where, doc, getDoc,
    serverTimestamp, deleteDoc, updateDoc, onSnapshot,
  } from "firebase/firestore";
  import { db } from "../lib/firebase";
  
  // ---------- Тесты ----------
  export async function listTests(universityId) {
    const q = query(collection(db, "tests"), where("universityId", "==", universityId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
  
  export async function listTestsWithDetails(universityId) {
    const tests = await listTests(universityId);
  
    const subjectsSnap = await getDocs(query(collection(db, "subjects")));
    const subjectsById = {};
    subjectsSnap.docs.forEach((d) => {
      const data = d.data();
      if (data.universityId === universityId) subjectsById[d.id] = data.name;
    });
  
    const teachersSnap = await getDocs(query(collection(db, "users")));
    const teachersById = {};
    teachersSnap.docs.forEach((d) => {
      const data = d.data();
      if (data.role === "teacher" && data.universityId === universityId) {
        teachersById[d.id] =
          `${data.lastName || ""} ${data.firstName || ""}`.trim() || data.email;
      }
    });
  
    return tests.map((t) => ({
      ...t,
      subjectName: subjectsById[t.subjectId] || "—",
      authorName: teachersById[t.authorId] || "—",
    }));
  }
  
  export async function listSubjectsForTeacher(universityId) {
    const snap = await getDocs(query(collection(db, "subjects")));
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => s.universityId === universityId);
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  
  export async function createTest({
    universityId, authorId, authorName, title, subjectId, subjectName, questions,
  }) {
    const ref = await addDoc(collection(db, "tests"), {
      title, subjectId, subjectName, universityId, authorId, authorName,
      questions, createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function getTest(testId) {
    const snap = await getDoc(doc(db, "tests", testId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }
  
  export async function updateTest(testId, data) {
    await updateDoc(doc(db, "tests", testId), data);
  }
  
  export async function deleteTest(testId) {
    await deleteDoc(doc(db, "tests", testId));
  }
  
  // ---------- Группы для формы комнаты ----------
  export async function listGroupsForTeacher(universityId) {
    const snap = await getDocs(query(collection(db, "groups")));
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((g) => g.universityId === universityId);
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  
  // ---------- Комнаты ----------
  async function generateRoomCode() {
    for (let i = 0; i < 5; i++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const q = query(collection(db, "rooms"), where("code", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) return code;
    }
    throw new Error("Не удалось сгенерировать уникальный код комнаты");
  }
  
  export async function listRooms(universityId, teacherId) {
    const q = query(
      collection(db, "rooms"),
      where("universityId", "==", universityId),
      where("teacherId", "==", teacherId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
  
  export async function getRoom(roomId) {
    const snap = await getDoc(doc(db, "rooms", roomId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }
  
  export async function createRoom({
    universityId, teacherId, testId, testTitle, title, timePerQuestion, groupIds,
  }) {
    const code = await generateRoomCode();
    const ref = await addDoc(collection(db, "rooms"), {
      code,
      title: title || "",
      testId,
      testTitle: testTitle || "",
      teacherId,
      universityId,
      isOpen: true,
      timePerQuestion: Number(timePerQuestion) || 60,
      groupIds: groupIds || [],
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, code };
  }
  
  export async function closeRoom(roomId) {
    await updateDoc(doc(db, "rooms", roomId), { isOpen: false });
  }
  
  export async function deleteRoom(roomId) {
    await deleteDoc(doc(db, "rooms", roomId));
  }
  
  // Подписка на прогресс студентов
  export function subscribeRoomProgress(roomId, callback) {
    const q = query(collection(db, "rooms", roomId, "progress"));
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("subscribeRoomProgress error:", err)
    );
  }
  
  // Подписка на запросы повторного прохождения
  export function subscribeRetakeRequests(roomId, callback) {
    const q = query(collection(db, "rooms", roomId, "retakeRequests"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => (b.requestedAt?.seconds || 0) - (a.requestedAt?.seconds || 0)));
      },
      (err) => console.error("subscribeRetakeRequests error:", err)
    );
  }
  
  // Учитель решает: approve/reject
  export async function decideRetake({ roomId, studentId, decision, teacherId }) {
    const status = decision === "approve" ? "approved" : "rejected";
    const reqRef = doc(db, "rooms", roomId, "retakeRequests", studentId);
    const progRef = doc(db, "rooms", roomId, "progress", studentId);
  
    await updateDoc(reqRef, {
      status, decidedAt: serverTimestamp(), decidedBy: teacherId,
    });
  
    const patch = {
      retakeStatus: status,
      retakeDecidedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (decision === "approve") {
      // Явно сбрасываем всё, чтобы студент начал заново
      Object.assign(patch, {
        answered: 0, correct: 0, incorrect: 0, percentage: 0,
        finished: false,
      });
    }
    await updateDoc(progRef, patch);
  }