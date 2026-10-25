import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  listDepartments,
  createDepartment,
  deleteDepartment,
  listSubjects,
  createSubject,
  deleteSubject,
  listGroups,
  createGroup,
  deleteGroup,
  listTeachers,
  createTeacher,
} from "../../services/adminService";
import { formatPhone, toE164, isValidUzPhone } from "../../lib/phone";

const tabs = [
  { key: "departments", label: "Кафедры" },
  { key: "subjects", label: "Предметы" },
  { key: "groups", label: "Группы" },
  { key: "teachers", label: "Учителя" },
];

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function AdminDashboard() {
  const { universityId, user } = useAuthStore();
  const [tab, setTab] = useState("departments");

  if (!universityId) {
    return (
      <div className="p-6 rounded-xl bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        К вашему аккаунту не привязан вуз. Обратитесь к суперадмину.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Кабинет администратора</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        {user?.email} · вуз: {universityId}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
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
        {tab === "departments" && (
          <DepartmentsTab universityId={universityId} />
        )}
        {tab === "subjects" && <SubjectsTab universityId={universityId} />}
        {tab === "groups" && <GroupsTab universityId={universityId} />}
        {tab === "teachers" && <TeachersTab universityId={universityId} />}
      </div>
    </div>
  );
}

// ---------- Кафедры ----------
function DepartmentsTab({ universityId }) {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    listDepartments(universityId)
      .then(setList)
      .catch(() => setMsg("Не удалось загрузить"));

  useEffect(() => {
    load();
  }, [universityId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await createDepartment({ universityId, name });
      setName("");
      load();
    } catch (err) {
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Удалить кафедру?")) return;
    await deleteDepartment(id);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новая кафедра</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Название кафедры"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
          <button
            disabled={busy}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Создаём..." : "Создать"}
          </button>
          {msg && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>
          )}
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Список ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((d) => (
              <li
                key={d.id}
                className="py-2.5 text-sm flex items-center justify-between gap-2"
              >
                <span>{d.name}</span>
                <button
                  onClick={() => remove(d.id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Предметы ----------
function SubjectsTab({ universityId }) {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", departmentId: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([listSubjects(universityId), listDepartments(universityId)])
      .then(([s, d]) => {
        setList(s);
        setDepartments(d);
      })
      .catch(() => setMsg("Не удалось загрузить"));

  useEffect(() => {
    load();
  }, [universityId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await createSubject({
        universityId,
        name: form.name,
        departmentId: form.departmentId,
      });
      setForm({ name: "", departmentId: "" });
      load();
    } catch (err) {
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Удалить предмет?")) return;
    await deleteSubject(id);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новый предмет</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Название предмета"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={input}
          />
          <select
            required
            value={form.departmentId}
            onChange={(e) =>
              setForm((f) => ({ ...f, departmentId: e.target.value }))
            }
            className={input}
          >
            <option value="">Выберите кафедру</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            disabled={busy}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Создаём..." : "Создать"}
          </button>
          {msg && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>
          )}
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Список ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((s) => {
              const dep = departments.find((d) => d.id === s.departmentId);
              return (
                <li
                  key={s.id}
                  className="py-2.5 text-sm flex items-center justify-between gap-2"
                >
                  <span>
                    {s.name}
                    {dep && (
                      <span className="ml-2 text-xs text-slate-500">
                        ({dep.name})
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => remove(s.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Удалить
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Группы (формат 24.76D) ----------
function GroupsTab({ universityId }) {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    year: "", // 2 цифры
    number: "", // 2 цифры
    letter: "", // A-Z
    departmentId: "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([listGroups(universityId), listDepartments(universityId)])
      .then(([g, d]) => {
        setList(g);
        setDepartments(d);
      })
      .catch(() => setMsg("Не удалось загрузить"));

  useEffect(() => {
    load();
  }, [universityId]);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const groupName =
    form.year.length === 2 && form.number.length === 2 && form.letter
      ? `${form.year}.${form.number}${form.letter}`
      : "";

  const onDigits = (key) => (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setForm((f) => ({ ...f, [key]: v }));
  };

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!groupName) {
      setMsg("Заполните: 2 цифры, 2 цифры и букву");
      return;
    }
    setBusy(true);
    try {
      await createGroup({
        universityId,
        name: groupName,
        departmentId: form.departmentId,
      });
      setForm({ year: "", number: "", letter: "", departmentId: "" });
      load();
    } catch (err) {
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Удалить группу?")) return;
    await deleteGroup(id);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новая группа</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              placeholder="24"
              value={form.year}
              onChange={onDigits("year")}
              className={input + " w-20 text-center"}
              maxLength={2}
            />
            <span className="text-xl font-bold text-slate-500">.</span>
            <input
              inputMode="numeric"
              placeholder="76"
              value={form.number}
              onChange={onDigits("number")}
              className={input + " w-20 text-center"}
              maxLength={2}
            />
            <select
              required
              value={form.letter}
              onChange={(e) =>
                setForm((f) => ({ ...f, letter: e.target.value }))
              }
              className={input + " w-20 text-center"}
            >
              <option value="">-</option>
              {letters.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-500">
            Итог:{" "}
            <span className="font-mono font-semibold">{groupName || "—"}</span>
          </div>

          <select
            value={form.departmentId}
            onChange={(e) =>
              setForm((f) => ({ ...f, departmentId: e.target.value }))
            }
            className={input}
          >
            <option value="">Кафедра (необязательно)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            disabled={busy || !groupName}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Создаём..." : "Создать"}
          </button>
          {msg && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>
          )}
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Список ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((g) => (
              <li
                key={g.id}
                className="py-2.5 text-sm flex items-center justify-between gap-2"
              >
                <span className="font-mono">{g.name}</span>
                <button
                  onClick={() => remove(g.id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Учителя ----------
function TeachersTab({ universityId }) {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    departmentId: "",
    phoneDigits: "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([listTeachers(universityId), listDepartments(universityId)])
      .then(([t, d]) => {
        setList(t);
        setDepartments(d);
      })
      .catch(() => setMsg("Не удалось загрузить"));

  useEffect(() => {
    load();
  }, [universityId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (form.phoneDigits && !isValidUzPhone(form.phoneDigits)) {
      setMsg("Телефон: 9 цифр");
      return;
    }
    setBusy(true);
    try {
      await createTeacher({
        universityId,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        departmentId: form.departmentId,
        phone: form.phoneDigits ? toE164(form.phoneDigits) : "",
      });
      setMsg("Учитель создан");
      setForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        middleName: "",
        departmentId: "",
        phoneDigits: "",
      });
      load();
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("email-already-in-use")) setMsg("Этот email уже занят");
      else setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новый учитель</h2>
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
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
            value={form.departmentId}
            onChange={set("departmentId")}
            className={input + " md:col-span-2"}
          >
            <option value="">Выберите кафедру</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
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
            {busy ? "Создаём..." : "Создать учителя"}
          </button>
          {msg && (
            <p className="md:col-span-2 text-sm text-slate-600 dark:text-slate-400">
              {msg}
            </p>
          )}
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Учителя ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((t) => {
              const dep = departments.find((d) => d.id === t.departmentId);
              return (
                <li key={t.id} className="py-2.5 text-sm">
                  <div className="font-medium">
                    {t.lastName} {t.firstName} {t.middleName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.email}
                    {dep && ` · ${dep.name}`}
                    {t.phone && ` · ${t.phone}`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
