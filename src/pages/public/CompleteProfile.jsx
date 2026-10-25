import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";
import { listUniversities } from "../../services/universitiesService";
import { formatPhone, toE164, isValidUzPhone } from "../../lib/phone";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const {
    user,
    role,
    universityId: storedUniversityId,
    loading,
    applyProfile,
  } = useAuthStore();

  const [universities, setUniversities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    phoneDigits: "",
    universityId: storedUniversityId || "",
    groupId: "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Предзаполняем ФИО и телефон из профиля (если уже есть)
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      lastName: f.lastName || user.lastName || "",
      firstName: f.firstName || user.firstName || "",
      middleName: f.middleName || user.middleName || "",
      phoneDigits:
        f.phoneDigits || (user.phone ? user.phone.replace(/^\+998/, "") : ""),
    }));
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    listUniversities()
      .then(setUniversities)
      .catch(() => setMsg("Не удалось загрузить вузы"));
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!form.universityId) {
      setGroups([]);
      return;
    }
    const q = query(
      collection(db, "groups"),
      where("universityId", "==", form.universityId)
    );
    getDocs(q)
      .then((snap) =>
        setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
      .catch(() => setMsg("Не удалось загрузить группы"));
  }, [form.universityId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.lastName.trim()) {
      setMsg("Введите фамилию");
      return;
    }
    if (!form.firstName.trim()) {
      setMsg("Введите имя");
      return;
    }
    if (!form.middleName.trim()) {
      setMsg("Введите отчество");
      return;
    }
    if (!isValidUzPhone(form.phoneDigits)) {
      setMsg("Введите 9 цифр номера телефона");
      return;
    }
    if (!form.universityId) {
      setMsg("Выберите вуз");
      return;
    }
    if (!form.groupId) {
      setMsg("Выберите группу");
      return;
    }

    setBusy(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        phone: toE164(form.phoneDigits),
        universityId: form.universityId,
        groupId: form.groupId,
      });

      const snap = await getDoc(doc(db, "users", user.uid));
      applyProfile(user, snap.data());
      navigate("/student", { replace: true });
    } catch (err) {
      console.error("updateDoc error:", err);
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Загрузка...</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-center">Завершите профиль</h1>
        <p className="text-sm text-center text-slate-500 mt-1">
          Заполните ФИО, телефон, выберите вуз и группу
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Фамилия"
            value={form.lastName}
            onChange={set("lastName")}
            className={input}
          />
          <input
            required
            placeholder="Имя"
            value={form.firstName}
            onChange={set("firstName")}
            className={input}
          />
          <input
            required
            placeholder="Отчество"
            value={form.middleName}
            onChange={set("middleName")}
            className={input}
          />

          <div className="flex items-center gap-2">
            <span className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              +998
            </span>
            <input
              required
              inputMode="numeric"
              placeholder="00-000-00-00"
              value={formatPhone(form.phoneDigits).replace(/^\+998-?/, "")}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneDigits: e.target.value }))
              }
              className={input}
            />
          </div>

          <select
            required
            value={form.universityId}
            onChange={set("universityId")}
            className={input}
          >
            <option value="">Выберите вуз</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            required
            value={form.groupId}
            onChange={set("groupId")}
            className={input}
            disabled={!form.universityId}
          >
            <option value="">Выберите группу</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {msg && <p className="text-sm text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Сохраняем..." : "Готово"}
          </button>
        </form>

        {role && <p className="mt-4 text-xs text-center text-slate-500"></p>}
      </div>
    </div>
  );
}
