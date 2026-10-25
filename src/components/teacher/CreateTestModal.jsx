import { useState } from "react";
import Modal from "../ui/Modal";
import { useAuthStore } from "../../store/authStore";
import { createTest } from "../../services/teacherService";

const input =
  "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

// ---------- Разбор импорта ----------
// Формат:
// # Вопрос 1
// + правильный ответ
// - неправильный ответ
// + ещё правильный
// # Вопрос 2
// ...
export function parseImport(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const questions = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("#")) {
      current = { text: line.slice(1).trim(), answers: [] };
      questions.push(current);
    } else if (line.startsWith("+") || line.startsWith("-")) {
      if (!current) continue;
      const isCorrect = line[0] === "+";
      const answerText = line.slice(1).trim();
      if (answerText)
        current.answers.push({ text: answerText, correct: isCorrect });
    }
  }
  return questions.filter((q) => q.text && q.answers.length > 0);
}

export default function CreateTestModal({
  open,
  onClose,
  subjects,
  onCreated,
}) {
  const { universityId, user } = useAuthStore();
  const [mode, setMode] = useState(null); // null | "manual" | "import"

  return (
    <Modal open={open} onClose={onClose} title="Создать тест" size="lg">
      {mode === null && (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("manual")}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-left transition"
          >
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-semibold">Вручную</div>
            <div className="text-sm text-slate-500 mt-1">
              Создать вопросы и ответы по одному
            </div>
          </button>
          <button
            onClick={() => setMode("import")}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-left transition"
          >
            <div className="text-2xl mb-2">📥</div>
            <div className="font-semibold">Импорт</div>
            <div className="text-sm text-slate-500 mt-1">
              Вставить готовый список в текстовом формате
            </div>
          </button>
        </div>
      )}

      {mode === "manual" && (
        <ManualForm
          subjects={subjects}
          universityId={universityId}
          user={user}
          onCancel={() => setMode(null)}
          onCreated={() => {
            setMode(null);
            onCreated?.();
            onClose();
          }}
        />
      )}

      {mode === "import" && (
        <ImportForm
          subjects={subjects}
          universityId={universityId}
          user={user}
          onCancel={() => setMode(null)}
          onCreated={() => {
            setMode(null);
            onCreated?.();
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

// ---------- Ручное создание ----------
function ManualForm({ subjects, universityId, user, onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", answers: [{ text: "", correct: false }] },
  ]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const setQuestionText = (qi, text) => {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, text } : q)));
  };
  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      { text: "", answers: [{ text: "", correct: false }] },
    ]);
  };
  const removeQuestion = (qi) => {
    setQuestions((qs) => qs.filter((_, i) => i !== qi));
  };
  const setAnswerText = (qi, ai, text) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? {
              ...q,
              answers: q.answers.map((a, j) => (j === ai ? { ...a, text } : a)),
            }
          : q
      )
    );
  };
  const toggleCorrect = (qi, ai) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === ai ? { ...a, correct: !a.correct } : a
              ),
            }
          : q
      )
    );
  };
  const addAnswer = (qi) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? { ...q, answers: [...q.answers, { text: "", correct: false }] }
          : q
      )
    );
  };
  const removeAnswer = (qi, ai) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q
      )
    );
  };

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!title.trim()) {
      setMsg("Введите название теста");
      return;
    }
    if (!subjectId) {
      setMsg("Выберите предмет");
      return;
    }

    // Валидация вопросов
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
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

    const subject = subjects.find((s) => s.id === subjectId);
    setBusy(true);
    try {
      await createTest({
        universityId,
        authorId: user.uid,
        authorName: `${user.displayName || ""}`.trim() || user.email,
        title: title.trim(),
        subjectId,
        subjectName: subject?.name || "",
        questions: questions.map((q) => ({
          text: q.text.trim(),
          answers: q.answers
            .filter((a) => a.text.trim())
            .map((a) => ({ text: a.text.trim(), correct: a.correct })),
        })),
      });
      onCreated?.();
    } catch (err) {
      console.error("createTest error:", err);
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        required
        placeholder="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={input}
      />
      <select
        required
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className={input}
      >
        <option value="">Выберите предмет</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500">
                Вопрос {qi + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Удалить вопрос
                </button>
              )}
            </div>
            <input
              placeholder="Текст вопроса"
              value={q.text}
              onChange={(e) => setQuestionText(qi, e.target.value)}
              className={input + " mb-3"}
            />
            <div className="space-y-2">
              {q.answers.map((a, ai) => (
                <div key={ai} className="flex items-center gap-2">
                  <input
                    placeholder={`Ответ ${ai + 1}`}
                    value={a.text}
                    onChange={(e) => setAnswerText(qi, ai, e.target.value)}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => toggleCorrect(qi, ai)}
                    title="Отметить как правильный"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition ${
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
                </div>
              ))}
              <button
                type="button"
                onClick={() => addAnswer(qi)}
                className="text-sm text-primary-600 font-medium hover:underline"
              >
                + Добавить ответ
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-primary-500 hover:text-primary-600"
      >
        + Добавить вопрос
      </button>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          Назад
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? "Создаём..." : "Создать тест"}
        </button>
      </div>
    </form>
  );
}

// ---------- Импорт ----------
function ImportForm({ subjects, universityId, user, onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const parsed = parseImport(raw);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!title.trim()) {
      setMsg("Введите название теста");
      return;
    }
    if (!subjectId) {
      setMsg("Выберите предмет");
      return;
    }
    if (parsed.length === 0) {
      setMsg(
        "Не найдено ни одного вопроса. Используйте # для вопроса, + и - для ответов."
      );
      return;
    }

    const subject = subjects.find((s) => s.id === subjectId);
    setBusy(true);
    try {
      await createTest({
        universityId,
        authorId: user.uid,
        authorName: `${user.displayName || ""}`.trim() || user.email,
        title: title.trim(),
        subjectId,
        subjectName: subject?.name || "",
        questions: parsed,
      });
      onCreated?.();
    } catch (err) {
      console.error("import error:", err);
      setMsg("Ошибка: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        required
        placeholder="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={input}
      />
      <select
        required
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className={input}
      >
        <option value="">Выберите предмет</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <div>
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
          Текст импорта
        </label>
        <textarea
          rows={10}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`# Вопрос 1\n+ правильный ответ\n- неправильный ответ\n# Вопрос 2\n+ ...`}
          className={input + " font-mono"}
        />
        <p className="mt-1 text-xs text-slate-500">
          Формат: <code>#</code> — начало вопроса, <code>+</code> — правильный
          ответ, <code>-</code> — неправильный.
        </p>
      </div>

      {raw.trim() && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
          Распознано вопросов: <strong>{parsed.length}</strong>
          {parsed.length > 0 && (
            <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
              {parsed.map((q, i) => (
                <li key={i}>
                  #{i + 1}: {q.text} — ответов: {q.answers.length}, правильных:{" "}
                  {q.answers.filter((a) => a.correct).length}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          Назад
        </button>
        <button
          type="submit"
          disabled={busy || parsed.length === 0}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? "Импортируем..." : "Импортировать"}
        </button>
      </div>
    </form>
  );
}
