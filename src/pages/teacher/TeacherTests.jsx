import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  listTestsWithDetails,
  listSubjectsForTeacher,
} from "../../services/teacherService";
import CreateTestModal from "../../components/teacher/CreateTestModal";

export default function TeacherTests() {
  const { universityId, user, role, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  console.log("[TeacherTests] authStore:", {
    universityId,
    role,
    authLoading,
    uid: user?.uid,
  });

  const load = async () => {
    if (!universityId) {
      console.warn(
        "[TeacherTests] universityId отсутствует — запросы не выполняются"
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const [testsData, subjectsData] = await Promise.all([
        listTestsWithDetails(universityId),
        listSubjectsForTeacher(universityId),
      ]);
      console.log(
        "[TeacherTests] tests:",
        testsData.length,
        "subjects:",
        subjectsData.length
      );
      setTests(testsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error("load tests/subjects error:", err);
      setMsg(
        "Не удалось загрузить данные: " + (err?.message || "неизвестная ошибка")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, authLoading]);

  const fmtDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString();
  };

  if (authLoading) {
    return <div className="p-6 text-slate-500">Загрузка профиля...</div>;
  }

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
          <h1 className="text-2xl font-bold">Тесты</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Все тесты вашего вуза
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/teacher"
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Назад
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Создать тест
          </button>
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}

      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">№</th>
              <th className="px-4 py-3 text-left font-semibold">Предмет</th>
              <th className="px-4 py-3 text-left font-semibold">
                Название теста
              </th>
              <th className="px-4 py-3 text-left font-semibold">Кем создан</th>
              <th className="px-4 py-3 text-left font-semibold">
                Когда создан
              </th>
              <th className="px-4 py-3 text-left font-semibold">Вопросов</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Загрузка...
                </td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Пока нет тестов
                </td>
              </tr>
            ) : (
              tests.map((t, i) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/teacher/tests/${t.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                >
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">{t.subjectName || "—"}</td>
                  <td className="px-4 py-3 font-medium">{t.title || "—"}</td>
                  <td className="px-4 py-3">{t.authorName || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {fmtDate(t.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {Array.isArray(t.questions)
                      ? t.questions.length
                      : t.questionsCount ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Всего тестов: <span className="font-semibold">{tests.length}</span>
      </p>

      <CreateTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subjects={subjects}
        onCreated={load}
      />
    </div>
  );
}
