import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  listStudentResultsWithRank,
  findRoomByCode,
} from "../../services/studentService";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function StudentDashboard() {
  const { user, universityId, role } = useAuthStore();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState("");
  const [foundRoom, setFoundRoom] = useState(null);
  const [searchMsg, setSearchMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listStudentResultsWithRank(user.uid)
      .then(setResults)
      .catch((err) => {
        console.error(err);
        setMsg("Не удалось загрузить результаты");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const fmtDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  async function searchRoom(e) {
    e.preventDefault();
    setSearchMsg("");
    setFoundRoom(null);
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setSearchMsg("Код комнаты — 6 цифр");
      return;
    }
    setBusy(true);
    try {
      const room = await findRoomByCode(trimmed);
      if (!room) {
        setSearchMsg("Комната не найдена");
        return;
      }
      if (!room.isOpen) {
        setSearchMsg("Комната закрыта");
        return;
      }
      if (room.universityId !== universityId) {
        setSearchMsg("Комната другого вуза");
        return;
      }
      setFoundRoom(room);
    } catch (err) {
      console.error("findRoomByCode error:", err);
      setSearchMsg("Ошибка поиска: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  function join() {
    if (!foundRoom) return;
    navigate(`/student/room/${foundRoom.id}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Кабинет студента</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {user?.email} · роль: {role}
          </p>
        </div>
        <button
          onClick={() => {
            setJoinOpen(true);
            setFoundRoom(null);
            setCode("");
            setSearchMsg("");
          }}
          className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Войти в комнату
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}

      {/* Модалка поиска комнаты */}
      {joinOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setJoinOpen(false)}
          />
          <div className="relative w-full max-w-md my-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Войти в комнату</h2>
              <button
                onClick={() => setJoinOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={searchRoom} className="space-y-3">
              <input
                required
                inputMode="numeric"
                placeholder="6-значный код комнаты"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={
                  input + " font-mono text-lg tracking-widest text-center"
                }
                maxLength={6}
              />
              <button
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {busy ? "Ищем..." : "Найти"}
              </button>
              {searchMsg && <p className="text-sm text-red-600">{searchMsg}</p>}
            </form>

            {foundRoom && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Комната найдена
                </p>
                <p className="mt-1 text-2xl font-extrabold font-mono">
                  {foundRoom.code}
                </p>
                {foundRoom.title && (
                  <p className="text-sm">{foundRoom.title}</p>
                )}
                {foundRoom.testTitle && (
                  <p className="text-xs text-slate-600">
                    Тест: {foundRoom.testTitle}
                  </p>
                )}
                <button
                  onClick={join}
                  className="mt-3 w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
                >
                  Войти
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* История результатов */}
      <h2 className="mt-8 text-lg font-semibold">
        Пройденные тесты ({results.length})
      </h2>
      <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">№</th>
              <th className="px-4 py-3 text-left">Тест</th>
              <th className="px-4 py-3 text-left">Комната</th>
              <th className="px-4 py-3 text-left">Всего</th>
              <th className="px-4 py-3 text-left">Правильных</th>
              <th className="px-4 py-3 text-left">Неправильных</th>
              <th className="px-4 py-3 text-left">%</th>
              <th className="px-4 py-3 text-left">Место</th>
              <th className="px-4 py-3 text-left">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Загрузка...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Пока нет пройденных тестов
                </td>
              </tr>
            ) : (
              results.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {r.testTitle || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono">{r.roomCode || "—"}</td>
                  <td className="px-4 py-3">{r.totalQuestions ?? "—"}</td>
                  <td className="px-4 py-3 text-green-700 font-semibold">
                    {r.correct ?? 0}
                  </td>
                  <td className="px-4 py-3 text-red-600">{r.incorrect ?? 0}</td>
                  <td className="px-4 py-3 font-semibold">
                    {r.percentage != null
                      ? `${Number(r.percentage).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {r.rank != null && r.totalParticipants != null
                      ? `${r.totalParticipants}/${r.rank}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {fmtDate(r.finishedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
