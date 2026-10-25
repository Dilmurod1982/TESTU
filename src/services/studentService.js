import {
    collection, getDocs, query, where, doc, getDoc, setDoc,
    updateDoc, serverTimestamp, onSnapshot,
  } from "firebase/firestore";
  import { db } from "../lib/firebase";
  import { formatShortName } from "../lib/formatName";
  
  export async function listStudentResults(studentId) {
    const q = query(collection(db, "results"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.finishedAt?.seconds || 0) - (a.finishedAt?.seconds || 0));
  }
  
  // Результаты с местом в рейтинге по комнате
  export async function listStudentResultsWithRank(studentId) {
    const results = await listStudentResults(studentId);
    const enriched = [];
    for (const r of results) {
      try {
        // Все результаты этой комнаты
        const q = query(collection(db, "results"), where("roomId", "==", r.roomId));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Сортируем по проценту, затем по correct (при равенстве)
        all.sort((a, b) => {
          if ((b.percentage ?? 0) !== (a.percentage ?? 0)) {
            return (b.percentage ?? 0) - (a.percentage ?? 0);
          }
          return (b.correct ?? 0) - (a.correct ?? 0);
        });
        const idx = all.findIndex((x) => x.studentId === studentId);
        enriched.push({
          ...r,
          rank: idx >= 0 ? idx + 1 : null,
          totalParticipants: all.length,
        });
      } catch (err) {
        console.error("rank calc error:", err);
        enriched.push({ ...r, rank: null, totalParticipants: null });
      }
    }
    return enriched;
  }
  
  export async function findRoomByCode(code) {
    const q = query(collection(db, "rooms"), where("code", "==", code));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  
  export async function getProgress(roomId, studentId) {
    const snap = await getDoc(doc(db, "rooms", roomId, "progress", studentId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }
  
  export function subscribeProgress(roomId, studentId, callback) {
    const ref = doc(db, "rooms", roomId, "progress", studentId);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) { callback(null); return; }
        callback({ id: snap.id, ...snap.data() });
      },
      (err) => console.error("subscribeProgress error:", err)
    );
  }
  
  export async function joinRoom({ roomId, student, test }) {
    const ref = doc(db, "rooms", roomId, "progress", student.uid);
    const shortName = formatShortName({
      lastName: student.lastName,
      firstName: student.firstName,
      middleName: student.middleName,
    });
    await setDoc(ref, {
      studentId: student.uid,
      studentName: shortName,
      groupName: student.groupName || "",
      totalQuestions: test?.questions?.length || 0,
      answered: 0, correct: 0, incorrect: 0, percentage: 0,
      finished: false,
      retakeStatus: "none",
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return ref.id;
  }
  
  export async function updateProgress({
    roomId, studentId, answered, correct, incorrect, percentage, finished = false,
  }) {
    const ref = doc(db, "rooms", roomId, "progress", studentId);
    await updateDoc(ref, {
      answered, correct, incorrect, percentage, finished,
      updatedAt: serverTimestamp(),
    });
  }
  
  export async function requestRetake({ roomId, student, test }) {
    const reqRef = doc(db, "rooms", roomId, "retakeRequests", student.uid);
    const progRef = doc(db, "rooms", roomId, "progress", student.uid);
    await setDoc(reqRef, {
      studentId: student.uid,
      studentName: formatShortName({
        lastName: student.lastName,
        firstName: student.firstName,
        middleName: student.middleName,
      }),
      groupName: student.groupName || "",
      status: "pending",
      requestedAt: serverTimestamp(),
    }, { merge: true });
    await updateDoc(progRef, {
      retakeStatus: "pending",
      retakeRequestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }