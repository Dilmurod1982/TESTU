import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";
import {
  subscribeRoomProgress,
  subscribeRetakeRequests,
  decideRetake,
} from "../../services/teacherService";

export default function TeacherRoomView() {
  const { roomId } = useParams();
  const { user } = useAuthStore();

  const [room, setRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [retakes, setRetakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getDoc(doc(db, "rooms", roomId))
      .then((snap) => {
        if (!snap.exists()) {
          setMsg("Комната не найдена");
          return;
        }
        setRoom({ id: snap.id, ...snap.data() });
      })
      .catch((err) => {
        console.error(err);
        setMsg("Ошибка загрузки комнаты");
      })
      .finally(() => setLoading(false));

    const unsubProgress = subscribeRoomProgress(roomId, (list) => {
      setStudents(list.sort((a, b) => (b.correct || 0) - (a.correct || 0)));
    });
    const unsubRetakes = subscribeRetakeRequests(roomId, setRetakes);

    return () => {
      unsubProgress();
      unsubRetakes();
    };
  }, [roomId]);

  async function handleDecision(studentId, decision) {
    try {
      await decideRetake({ roomId, studentId, decision, teacherId: user.uid });
    } catch (err) {
      console.error("decideRetake error:", err);
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Загрузка...</div>;
  if (!room)
    return (
      <div className="p-6 text-red-600">{msg || "Комната не найдена"}</div>
    );

  const pendingRetakes = retakes.filter((r) => r.status === "pending");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Комната {room.code}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {room.title || "Без названия"} · Тест: {room.testTitle || "—"}
          </p>
          <p className="text-sm text-slate-500">
            Время на вопрос: {room.timePerQuestion || 60} сек · Статус:{" "}
            {room.isOpen ? "Открыта" : "Закрыта"}
          </p>
        </div>
        <Link
          to="/teacher"
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Назад
        </Link>
      </div>

      <h2 className="mt-6 text-lg font-semibold">
        Студенты онлайн ({students.length})
      </h2>
      <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">№</th>
              <th className="px-4 py-3 text-left">Студент</th>
              <th className="px-4 py-3 text-left">Группа</th>
              <th className="px-4 py-3 text-left">Всего</th>
              <th className="px-4 py-3 text-left">Решено</th>
              <th className="px-4 py-3 text-left">Правильных</th>
              <th className="px-4 py-3 text-left">Неправильных</th>
              <th className="px-4 py-3 text-left">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Пока никто не вошёл
                </td>
              </tr>
            ) : (
              students.map((s, i) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {s.studentName || s.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.groupName || "—"}
                  </td>
                  <td className="px-4 py-3">{s.totalQuestions ?? "—"}</td>
                  <td className="px-4 py-3">{s.answered ?? 0}</td>
                  <td className="px-4 py-3 text-green-700 font-semibold">
                    {s.correct ?? 0}
                  </td>
                  <td className="px-4 py-3 text-red-600">{s.incorrect ?? 0}</td>
                  <td className="px-4 py-3 font-semibold">
                    {s.percentage != null
                      ? `${Number(s.percentage).toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold">
        Запросы на повторное прохождение ({pendingRetakes.length})
      </h2>
      <div className="mt-3 space-y-2">
        {retakes.length === 0 ? (
          <p className="text-sm text-slate-500">Нет запросов</p>
        ) : (
          retakes.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium">
                  {r.studentName || r.studentId}
                </div>
                <div className="text-xs text-slate-500">
                  {r.groupName || "—"} · {r.status}
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(r.studentId, "approve")}
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                  >
                    Разрешить
                  </button>
                  <button
                    onClick={() => handleDecision(r.studentId, "reject")}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    Отказать
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
