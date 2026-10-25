import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getTest, updateTest, deleteTest } from "../../services/teacherService";

const input =
  "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

export default function TeacherTestView() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getTest(testId)
      .then((t) => {
        if (!t) {
          setMsg("Тест не найден");
          return;
        }
        setTest(t);
        setDraft(JSON.parse(JSON.stringify(t))); // глубокая копия для редактирования
      })
      .catch((err) => {
        console.error("getTest error:", err);
        setMsg("Не удалось загрузить тест: " + (err?.message || ""));
      })
      .finally(() => setLoading(false));
  }, [testId]);

  const isOwner = test && user && test.authorId === user.uid;

  const fmtDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  // ---------- Редактирование ----------
  const setQuestionText = (qi, text) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === qi ? { ...q, text } : q)),
    }));
  };
  const setAnswerText = (qi, ai, text) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qi
          ? {
              ...q,
              answers: q.answers.map((a, j) => (j === ai ? { ...a, text } : a)),
            }
          : q
      ),
    }));
  };
  const toggleCorrect = (qi, ai) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qi
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === ai ? { ...a, correct: !a.correct } : a
              ),
            }
          : q
      ),
    }));
  };
  const addAnswer = (qi) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qi
          ? { ...q, answers: [...q.answers, { text: "", correct: false }] }
          : q
      ),
    }));
  };
  const removeAnswer = (qi, ai) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q
      ),
    }));
  };
  const addQuestion = () => {
    setDraft((d) => ({
      ...d,
      questions: [
        ...d.questions,
        { text: "", answers: [{ text: "", correct: false }] },
      ],
    }));
  };
  const removeQuestion = (qi) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.filter((_, i) => i !== qi),
    }));
  };

  async function save() {
    setMsg("");
    // Валидация
    if (!draft.title.trim()) {
      setMsg("Введите название теста");
      return;
    }
    for (let qi = 0; qi < draft.questions.length; qi++) {
      const q = draft.questions[qi];
      if (!q.text.trim()) {
        setMsg(`Вопрос ${qi + 1}: введите текст`);
        return;
      }
      const filled = q.answers.filter((a) => a.text.trim());
      if (filled.length < 2) {
        setMsg(`Вопрос ${qi + 1}: минимум 2 ответа`);
        return;
      }
      if (!filled.some((a) => a.correct)) {
        setMsg(`Вопрос ${qi + 1}: отметьте правильный ответ`);
        return;
      }
    }
    setBusy(true);
    try {
      const cleaned = {
        title: draft.title.trim(),
        questions: draft.questions.map((q) => ({
          text: q.text.trim(),
          answers: q.answers
            .filter((a) => a.text.trim())
            .map((a) => ({ text: a.text.trim(), correct: a.correct })),
        })),
      };
      await updateTest(testId, cleaned);
      setTest({ ...test, ...cleaned });
      setDraft(JSON.parse(JSON.stringify({ ...test, ...cleaned })));
      setEditing(false);
      setMsg("Сохранено");
    } catch (err) {
      console.error("updateTest error:", err);
      setMsg("Ошибка сохранения: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить тест? Это действие необратимо.")) return;
    setBusy(true);
    try {
      await deleteTest(testId);
      navigate("/teacher/tests");
    } catch (err) {
      console.error("deleteTest error:", err);
      setMsg("Ошибка удаления: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Загрузка...</div>;
  if (!test)
    return <div className="p-6 text-red-600">{msg || "Тест не найден"}</div>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {test.subjectName || "—"} · {test.authorName || "—"} ·{" "}
            {fmtDate(test.createdAt)}
          </p>
          <p className="text-sm text-slate-500">
            Вопросов: {test.questions?.length || 0}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/teacher/tests"
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Назад
          </Link>
          {isOwner && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
              >
                Редактировать
              </button>
              <button
                onClick={remove}
                disabled={busy}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Удалить
              </button>
            </>
          )}
        </div>
      </div>

      {msg && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{msg}</p>
      )}

      <div className="mt-6 space-y-4">
        {(editing ? draft.questions : test.questions || []).map((q, qi) => (
          <div
            key={qi}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-500">
                  Вопрос {qi + 1}
                </span>
                {editing ? (
                  <input
                    value={q.text}
                    onChange={(e) => setQuestionText(qi, e.target.value)}
                    className={input + " mt-1"}
                  />
                ) : (
                  <div className="mt-1 font-medium">{q.text}</div>
                )}
              </div>
              {editing && draft.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Удалить вопрос
                </button>
              )}
            </div>

            <ul className="space-y-2">
              {q.answers.map((a, ai) => (
                <li key={ai} className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <input
                        value={a.text}
                        onChange={(e) => setAnswerText(qi, ai, e.target.value)}
                        className={input}
                      />
                      <button
                        type="button"
                        onClick={() => toggleCorrect(qi, ai)}
                        title="Правильный ответ"
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold ${
                          a.correct
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                      >
                        ✓
                      </button>
                      {q.answers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAnswer(qi, ai)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  ) : (
                    <span
                      className={`px-3 py-2 rounded-lg w-full text-sm ${
                        a.correct
                          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                          : "bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      {a.correct && <span className="font-bold mr-2">✓</span>}
                      {a.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {editing && (
              <button
                type="button"
                onClick={() => addAnswer(qi)}
                className="mt-2 text-sm text-primary-600 font-medium hover:underline"
              >
                + Добавить ответ
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-primary-500 hover:text-primary-600"
          >
            + Добавить вопрос
          </button>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(JSON.parse(JSON.stringify(test)));
                setEditing(false);
                setMsg("");
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {busy ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
