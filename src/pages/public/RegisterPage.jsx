import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listUniversities } from "../../services/universitiesService";
import { registerStudent } from "../../services/registerService";
import { formatPhone, isValidUzPhone, toE164 } from "../../lib/phone";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    middleName: "",
    universityId: "",
    groupId: "",
    phoneDigits: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUniversities()
      .then(setUniversities)
      .catch(() => setError("Не удалось загрузить список вузов"));
  }, []);

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
      .catch(() => setError("Не удалось загрузить группы"));
  }, [form.universityId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.lastName.trim()) {
      setError("Введите фамилию");
      return;
    }
    if (!form.firstName.trim()) {
      setError("Введите имя");
      return;
    }
    if (!form.middleName.trim()) {
      setError("Введите отчество");
      return;
    }
    if (!isValidUzPhone(form.phoneDigits)) {
      setError("Введите 9 цифр номера телефона");
      return;
    }
    if (!form.universityId) {
      setError("Выберите вуз");
      return;
    }
    if (!form.groupId) {
      setError("Выберите группу");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    setBusy(true);
    try {
      await registerStudent({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim(),
        phone: toE164(form.phoneDigits),
        universityId: form.universityId,
        groupId: form.groupId,
      });
      navigate("/student", { replace: true });
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("email-already-in-use"))
        setError("Этот email уже занят");
      else if (code.includes("weak-password"))
        setError("Слишком слабый пароль");
      else setError("Ошибка регистрации: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-center">
          {t("auth.registerTitle")}
        </h1>
        <p className="text-sm text-center text-slate-500 mt-1">
          {t("auth.registerSubtitle")}
        </p>

        <form
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set("email")}
            className={input + " md:col-span-2"}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder={t("auth.password")}
            value={form.password}
            onChange={set("password")}
            className={input + " md:col-span-2"}
          />
          <input
            required
            placeholder={t("auth.lastName")}
            value={form.lastName}
            onChange={set("lastName")}
            className={input}
          />
          <input
            required
            placeholder={t("auth.firstName")}
            value={form.firstName}
            onChange={set("firstName")}
            className={input}
          />
          <input
            required
            placeholder={t("auth.middleName")}
            value={form.middleName}
            onChange={set("middleName")}
            className={input + " md:col-span-2"}
          />

          <select
            required
            value={form.universityId}
            onChange={set("universityId")}
            className={input + " md:col-span-2"}
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
            className={input + " md:col-span-2"}
            disabled={!form.universityId}
          >
            <option value="">{t("auth.selectGroup")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="md:col-span-2 flex items-center gap-2">
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

          {error && (
            <p className="md:col-span-2 text-sm text-red-500">{error}</p>
          )}

          <button
            disabled={busy}
            type="submit"
            className="md:col-span-2 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Регистрируем..." : t("auth.registerBtn")}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-primary-600 font-medium">
            {t("nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
