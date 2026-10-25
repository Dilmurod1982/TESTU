import { useEffect, useState } from "react";
import {
  createUniversity,
  listUniversities,
  createAdmin,
} from "../../services/superadminService";
import { formatPhone, toE164, isValidUzPhone } from "../../lib/phone";

const tabs = [
  { key: "universities", label: "Вузы" },
  { key: "admins", label: "Админы" },
];

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("universities");

  return (
    <div>
      <h1 className="text-2xl font-bold">Кабинет суперадмина</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Управление вузами и администраторами.
      </p>

      <div className="mt-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "universities" && <UniversitiesTab />}
        {tab === "admins" && <AdminsTab />}
      </div>
    </div>
  );
}

function UniversitiesTab() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", shortName: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    listUniversities()
      .then(setList)
      .catch(() => setMsg("Не удалось загрузить вузы"));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await createUniversity(form);
      setForm({ name: "", shortName: "" });
      setMsg("Вуз создан");
      load();
    } catch (err) {
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новый вуз</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Полное название"
            value={form.name}
            onChange={set("name")}
            className={input}
          />
          <input
            placeholder="Сокращённо (необязательно)"
            value={form.shortName}
            onChange={set("shortName")}
            className={input}
          />
          <button
            disabled={busy}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Создаём..." : "Создать вуз"}
          </button>
          {msg && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>
          )}
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">
          Список вузов ({list.length})
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((u) => (
              <li key={u.id} className="py-2.5 text-sm">
                <span className="font-medium">{u.name}</span>
                {u.shortName && (
                  <span className="ml-2 text-slate-500">({u.shortName})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AdminsTab() {
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    universityId: "",
    phoneDigits: "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUniversities()
      .then(setUniversities)
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.universityId) {
      setMsg("Выберите вуз");
      return;
    }
    if (form.phoneDigits && !isValidUzPhone(form.phoneDigits)) {
      setMsg("Телефон: 9 цифр");
      return;
    }
    setBusy(true);
    try {
      await createAdmin({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        phone: form.phoneDigits ? toE164(form.phoneDigits) : "",
        universityId: form.universityId,
      });
      setMsg("Админ создан");
      setForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        middleName: "",
        universityId: "",
        phoneDigits: "",
      });
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("email-already-in-use")) setMsg("Этот email уже занят");
      else setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-2xl">
      <h2 className="font-semibold text-lg mb-4">Новый администратор</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          placeholder="Пароль (мин. 6)"
          value={form.password}
          onChange={set("password")}
          className={input + " md:col-span-2"}
        />
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
          placeholder="Отчество"
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
        <div className="md:col-span-2 flex items-center gap-2">
          <span className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            +998
          </span>
          <input
            inputMode="numeric"
            placeholder="00-000-00-00"
            value={formatPhone(form.phoneDigits).replace(/^\+998-?/, "")}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneDigits: e.target.value }))
            }
            className={input}
          />
        </div>
        <button
          disabled={busy}
          className="md:col-span-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? "Создаём..." : "Создать админа"}
        </button>
        {msg && (
          <p className="md:col-span-2 text-sm text-slate-600 dark:text-slate-400">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
