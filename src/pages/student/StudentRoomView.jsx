import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";
import {
  joinRoom,
  updateProgress,
  requestRetake,
  subscribeProgress,
} from "../../services/studentService";
import { formatShortName } from "../../lib/formatName";

// Перемешивание (Фишер–Йетс)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudentRoomView() {
  const { roomId } = useParams();
  const { user, lastName, firstName, middleName, groupId, universityId } =
    useAuthStore();

  const [room, setRoom] = useState(null);
  const [test, setTest] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Вопросы с перемешанными ответами (создаются один раз при старте)
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const roomSnap = await getDoc(doc(db, "rooms", roomId));
        if (!roomSnap.exists()) {
          setMsg("Комната не найдена");
          return;
        }
        const roomData = { id: roomSnap.id, ...roomSnap.data() };
        setRoom(roomData);
        if (!roomData.isOpen) {
          setMsg("Комната закрыта");
          return;
        }
        if (universityId && roomData.universityId !== universityId) {
          setMsg("Комната другого вуза");
          return;
        }
        if (Array.isArray(roomData.groupIds) && roomData.groupIds.length > 0) {
          if (!groupId || !roomData.groupIds.includes(groupId)) {
            setMsg("Ваша группа не может войти в эту комнату");
            return;
          }
        }
        const testSnap = await getDoc(doc(db, "tests", roomData.testId));
        if (!testSnap.exists()) {
          setMsg("Тест не найден");
          return;
        }
        setTest({ id: testSnap.id, ...testSnap.data() });
      } catch (err) {
        console.error("load error:", err);
        setMsg("Ошибка загрузки: " + (err?.message || ""));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId, groupId, universityId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeProgress(roomId, user.uid, (prog) =>
      setProgress(prog)
    );
    return () => unsub();
  }, [roomId, user]);

  const questions = shuffledQuestions;
  const currentQuestion = questions[current];
  const correctCount = useMemo(
    () => currentQuestion?.answers?.filter((a) => a.correct).length || 0,
    [currentQuestion]
  );
  const multiple = correctCount > 1;

  useEffect(() => {
    if (!started || finished || !currentQuestion) return;
    setTimeLeft(Number(room?.timePerQuestion) || 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleNext(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, current, finished]);

  async function startTest() {
    if (!user || !test) return;
    try {
      await joinRoom({
        roomId,
        student: {
          uid: user.uid,
          lastName,
          firstName,
          middleName,
          groupName: "",
        },
        test,
      });
      // Перемешиваем ответы в каждом вопросе
      const prepared = (test.questions || []).map((q) => ({
        ...q,
        answers: shuffle(q.answers || []),
      }));
      setShuffledQuestions(prepared);
      setStarted(true);
      setCurrent(0);
      setSelected([]);
      setAnswersLog([]);
      setFinished(false);
    } catch (err) {
      console.error("joinRoom error:", err);
      setMsg("Не удалось войти в комнату: " + (err?.message || ""));
    }
  }

  function toggleAnswer(idx) {
    if (multiple) {
      setSelected((s) =>
        s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx]
      );
    } else {
      setSelected([idx]);
    }
  }

  async function handleNext(timeout = false) {
    if (timerRef.current) clearInterval(timerRef.current);
    const q = questions[current];
    const selectedIdx = timeout ? [] : selected;
    const correctIdx = q.answers
      .map((a, i) => (a.correct ? i : -1))
      .filter((i) => i >= 0);
    const isCorrect =
      selectedIdx.length === correctIdx.length &&
      selectedIdx.every((i) => correctIdx.includes(i));

    const log = [
      ...answersLog,
      { questionIndex: current, selected: selectedIdx, correct: isCorrect },
    ];
    setAnswersLog(log);

    const answered = log.length;
    const correct = log.filter((l) => l.correct).length;
    const incorrect = answered - correct;
    const percentage =
      questions.length > 0 ? (correct / questions.length) * 100 : 0;
    try {
      await updateProgress({
        roomId,
        studentId: user.uid,
        answered,
        correct,
        incorrect,
        percentage,
        finished: current + 1 >= questions.length,
      });
    } catch (err) {
      console.error("updateProgress error:", err);
    }

    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected([]);
    } else {
      await finish(log);
    }
  }

  async function finish(log) {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const total = questions.length;
    const correct = log.filter((l) => l.correct).length;
    const incorrect = total - correct;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    try {
      await updateProgress({
        roomId,
        studentId: user.uid,
        answered: log.length,
        correct,
        incorrect,
        percentage,
        finished: true,
      });
      await addDoc(collection(db, "results"), {
        studentId: user.uid,
        studentName: formatShortName({ lastName, firstName, middleName }),
        roomId,
        roomCode: room.code,
        testId: room.testId,
        testTitle: room.testTitle || test.title,
        totalQuestions: total,
        correct,
        incorrect,
        percentage,
        finishedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("finish error:", err);
      setMsg("Ошибка сохранения результата: " + (err?.message || ""));
    }
  }

  async function handleRequestRetake() {
    try {
      await requestRetake({
        roomId,
        student: {
          uid: user.uid,
          lastName,
          firstName,
          middleName,
          groupName: "",
        },
        test,
      });
    } catch (err) {
      console.error("requestRetake error:", err);
      setMsg("Не удалось отправить запрос: " + (err?.message || ""));
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Загрузка...</div>;
  if (!room || !test)
    return (
      <div className="p-6 text-red-600">
        {msg || "Комната или тест не найдены"}
      </div>
    );

  // Результат
  if (started && finished) {
    const total = questions.length;
    const correct = answersLog.filter((l) => l.correct).length;
    const incorrect = total - correct;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Тест завершён</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Правильных: {correct} из {total} ({percentage.toFixed(1)}%)
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Неправильных: {incorrect}
        </p>
        <Link
          to="/student"
          className="mt-6 inline-block px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium"
        >
          В кабинет
        </Link>
        {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
      </div>
    );
  }

  // Вопросы
  if (started && !finished) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Вопрос {current + 1} из {questions.length}
          </div>
          <div
            className={`text-sm font-mono px-3 py-1 rounded-lg ${
              timeLeft <= 10
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {timeLeft} сек
          </div>
        </div>
        <h2 className="mt-4 text-xl font-semibold">{currentQuestion.text}</h2>
        <div className="mt-4 space-y-2">
          {currentQuestion.answers.map((a, i) => {
            const checked = selected.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  checked
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                    : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="inline-block w-6 h-6 rounded-full border mr-2 text-center text-xs leading-6">
                  {checked ? "✓" : ""}
                </span>
                {a.text}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {multiple
            ? "Можно выбрать несколько ответов"
            : "Можно выбрать только один ответ"}
        </p>
        <button
          onClick={() => handleNext(false)}
          className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          {current + 1 < questions.length ? "Следующий вопрос" : "Завершить"}
        </button>
      </div>
    );
  }

  // Статусы повторного прохождения (сначала проверяем retakeStatus)
  if (progress?.retakeStatus === "approved") {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Комната {room.code}</h1>
        <p className="mt-1 text-green-600 dark:text-green-400">
          Повторное прохождение разрешено учителем.
        </p>
        <button
          onClick={startTest}
          className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          Начать заново
        </button>
        <Link
          to="/student"
          className="ml-3 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          Назад
        </Link>
      </div>
    );
  }

  if (progress?.retakeStatus === "pending") {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Комната {room.code}</h1>
        <p className="mt-1 text-amber-600 dark:text-amber-400">
          Запрос на повторное прохождение отправлен. Ожидайте решения учителя.
        </p>
        <Link
          to="/student"
          className="mt-6 inline-block px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          В кабинет
        </Link>
      </div>
    );
  }

  if (progress?.retakeStatus === "rejected") {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Комната {room.code}</h1>
        <p className="mt-1 text-red-600 dark:text-red-400">
          Учитель отклонил повторное прохождение.
        </p>
        <button
          onClick={handleRequestRetake}
          className="mt-4 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          Запросить ещё раз
        </button>
        <Link
          to="/student"
          className="ml-3 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          В кабинет
        </Link>
      </div>
    );
  }

  if (progress?.finished) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Комната {room.code}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Вы уже прошли этот тест. Чтобы пройти заново, отправьте запрос
          учителю.
        </p>
        <button
          onClick={handleRequestRetake}
          className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          Запросить повтор
        </button>
        <Link
          to="/student"
          className="ml-3 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
        >
          Назад
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Комната {room.code}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        {room.title || "Без названия"}
      </p>
      <p className="text-sm text-slate-500">
        Тест: {room.testTitle || test.title}
      </p>
      <p className="text-sm text-slate-500">
        Вопросов: {test.questions?.length || 0}
      </p>
      <p className="text-sm text-slate-500">
        Время на вопрос: {room.timePerQuestion || 60} сек
      </p>
      <button
        onClick={startTest}
        className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
      >
        Начать тест
      </button>
      <Link
        to="/student"
        className="ml-3 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
      >
        Назад
      </Link>
      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
