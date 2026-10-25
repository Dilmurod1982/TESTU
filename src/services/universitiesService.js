import { db } from "../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function listUniversities() {
  const q = query(collection(db, "universities"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}