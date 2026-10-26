import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { changePassword } from "../../services/authService";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function ChangePassword() {
  const { role } = useAuthStore();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (form.newPassword.length < 6) {
      setErr("Новый пароль — минимум 6 символов");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setErr("Пароли не совпадают");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setErr("Новый пароль должен отличаться от текущего");
      return;
    }

    setBusy(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg("Пароль успешно изменён");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      const code = e?.code || "";
      if (
        code.includes("wrong-password") ||
        code.includes("invalid-credential")
      ) {
        setErr("Текущий пароль неверен");
      } else if (code.includes("requires-recent-login")) {
        setErr("Сессия устарела. Войдите заново и повторите смену пароля.");
      } else if (code.includes("weak-password")) {
        setErr("Слишком слабый новый пароль");
      } else {
        setErr("Ошибка: " + (e?.message || "неизвестно"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Смена пароля</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Введите текущий пароль и новый.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          required
          type="password"
          placeholder="Текущий пароль"
          value={form.currentPassword}
          onChange={set("currentPassword")}
          className={input}
        />
        <input
          required
          type="password"
          placeholder="Новый пароль (мин. 6)"
          value={form.newPassword}
          onChange={set("newPassword")}
          className={input}
        />
        <input
          required
          type="password"
          placeholder="Повторите новый пароль"
          value={form.confirm}
          onChange={set("confirm")}
          className={input}
        />

        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? "Сохраняем..." : "Изменить пароль"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        <Link to={`/${role || ""}`} className="text-primary-600">
          ← Назад в кабинет
        </Link>
      </p>
    </div>
  );
}
