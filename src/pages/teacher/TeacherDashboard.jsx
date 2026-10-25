import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  listTests,
  listRooms,
  createRoom,
  closeRoom,
  deleteRoom,
  listGroupsForTeacher,
} from "../../services/teacherService";
import SearchableSelect from "../../components/ui/SearchableSelect";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function TeacherDashboard() {
  const { universityId, user } = useAuthStore();

  if (!universityId) {
    return (
      <div className="p-6 rounded-xl bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        К вашему аккаунту не привязан вуз. Обратитесь к администратору.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Кабинет учителя</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {user?.email} · вуз: {universityId}
          </p>
        </div>
        <Link
          to="/teacher/tests"
          className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Тесты
        </Link>
      </div>

      <div className="mt-6">
        <RoomsTab universityId={universityId} teacherId={user?.uid} />
      </div>
    </div>
  );
}

function RoomsTab({ universityId, teacherId }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [tests, setTests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    title: "",
    testId: "",
    timePerQuestion: 60,
    groupIds: [],
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);

  const load = () =>
    Promise.all([
      listRooms(universityId, teacherId),
      listTests(universityId),
      listGroupsForTeacher(universityId),
    ])
      .then(([r, t, g]) => {
        setRooms(r);
        setTests(t);
        setGroups(g);
      })
      .catch((err) => {
        console.error("load error:", err);
        setMsg("Не удалось загрузить");
      });

  useEffect(() => {
    load();
  }, [universityId, teacherId]);

  function removeGroup(id) {
    setForm((f) => ({ ...f, groupIds: f.groupIds.filter((g) => g !== id) }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setCreatedCode(null);
    if (!form.testId) {
      setMsg("Выберите тест");
      return;
    }
    if (form.groupIds.length === 0) {
      setMsg("Выберите хотя бы одну группу");
      return;
    }

    const test = tests.find((t) => t.id === form.testId);
    setBusy(true);
    try {
      const { code } = await createRoom({
        universityId,
        teacherId,
        testId: form.testId,
        testTitle: test?.title || "",
        title: form.title,
        timePerQuestion: form.timePerQuestion,
        groupIds: form.groupIds,
      });
      setCreatedCode(code);
      setForm({ title: "", testId: "", timePerQuestion: 60, groupIds: [] });
      load();
    } catch (err) {
      console.error("createRoom error:", err);
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function toggleClose(e, id, isOpen) {
    e.stopPropagation();
    if (!isOpen) return;
    if (!confirm("Закрыть комнату?")) return;
    await closeRoom(id);
    load();
  }

  async function remove(e, id) {
    e.stopPropagation();
    if (!confirm("Удалить комнату?")) return;
    await deleteRoom(id);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Форма создания комнаты */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">Новая комната</h2>

        {tests.length === 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            Нет тестов. Создайте тест в разделе «Тесты».
          </div>
        )}
        {groups.length === 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            Нет групп. Попросите администратора создать группы.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            placeholder="Название комнаты (необязательно)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={input}
          />

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Тест
            </label>
            <SearchableSelect
              options={tests.map((t) => ({ value: t.id, label: t.title }))}
              value={form.testId}
              onChange={(v) => setForm((f) => ({ ...f, testId: v }))}
              placeholder="Выберите тест"
              disabled={tests.length === 0}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Время на вопрос (сек):
            </label>
            <input
              type="number"
              min="10"
              max="600"
              required
              value={form.timePerQuestion}
              onChange={(e) =>
                setForm((f) => ({ ...f, timePerQuestion: e.target.value }))
              }
              className={input + " w-28"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Группы, которым разрешён вход
            </label>
            <div className="flex flex-wrap gap-2">
              {form.groupIds.map((gid) => {
                const g = groups.find((x) => x.id === gid);
                return (
                  <span
                    key={gid}
                    className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm inline-flex items-center gap-2"
                  >
                    {g?.name || gid}
                    <button
                      type="button"
                      onClick={() => removeGroup(gid)}
                      className="text-xs"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
            <SearchableSelect
              options={groups
                .filter((g) => !form.groupIds.includes(g.id))
                .map((g) => ({ value: g.id, label: g.name }))}
              value=""
              onChange={(v) => {
                if (!v) return;
                setForm((f) => ({
                  ...f,
                  groupIds: f.groupIds.includes(v)
                    ? f.groupIds
                    : [...f.groupIds, v],
                }));
              }}
              placeholder="+ Добавить группу"
              disabled={groups.length === 0}
            />
          </div>

          <button
            disabled={busy || !form.testId || form.groupIds.length === 0}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Создаём..." : "Создать комнату"}
          </button>

          {createdCode && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Комната создана. Код:
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-widest text-green-900 dark:text-green-100">
                {createdCode}
              </p>
            </div>
          )}
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </form>
      </div>

      {/* Список комнат */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-lg mb-4">
          Мои комнаты ({rooms.length})
        </h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {rooms.map((r) => (
              <li
                key={r.id}
                onClick={() => navigate(`/teacher/rooms/${r.id}`)}
                className="py-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold font-mono text-lg">
                    {r.code}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      r.isOpen
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {r.isOpen ? "Открыта" : "Закрыта"}
                  </span>
                </div>
                {r.title && <div className="mt-1">{r.title}</div>}
                {r.testTitle && (
                  <div className="text-xs text-slate-500">
                    Тест: {r.testTitle}
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  Время на вопрос: {r.timePerQuestion || 60} сек · Групп:{" "}
                  {r.groupIds?.length || 0}
                </div>
                <div className="mt-2 flex gap-3 text-xs">
                  {r.isOpen && (
                    <button
                      onClick={(e) => toggleClose(e, r.id, r.isOpen)}
                      className="text-amber-600 hover:underline"
                    >
                      Закрыть
                    </button>
                  )}
                  <button
                    onClick={(e) => remove(e, r.id)}
                    className="text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
