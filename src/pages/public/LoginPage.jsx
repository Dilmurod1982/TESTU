import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  loginWithEmail,
  loginWithGoogle,
  getUserProfile,
  ensureStudentProfile,
} from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { homeByRole } from "../../router/ProtectedRoute";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applyProfile } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const input =
    "w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500";

  function redirectByProfile(user, profile) {
    if (!profile?.role) {
      navigate("/complete-profile", { replace: true });
      return;
    }
    if (
      profile.role === "student" &&
      (!profile.universityId || !profile.groupId)
    ) {
      navigate("/complete-profile", { replace: true });
      return;
    }
    navigate(homeByRole[profile.role] || "/", { replace: true });
  }

  async function handleEmail(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const cred = await loginWithEmail(email.trim(), password);
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) profile = await ensureStudentProfile(cred.user);
      applyProfile(cred.user, profile);
      redirectByProfile(cred.user, profile);
    } catch (err) {
      const code = err?.code || "";
      if (
        code.includes("invalid-credential") ||
        code.includes("wrong-password") ||
        code.includes("user-not-found")
      ) {
        setError("Неверный email или пароль");
      } else {
        setError("Ошибка входа: " + (err?.message || "неизвестно"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      const cred = await loginWithGoogle();
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) profile = await ensureStudentProfile(cred.user);
      applyProfile(cred.user, profile);
      redirectByProfile(cred.user, profile);
    } catch (err) {
      setError("Не удалось войти через Google: " + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-center">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-sm text-center text-slate-500 mt-1">
          {t("auth.loginSubtitle")}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleEmail}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
          <input
            type="password"
            required
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? "Входим..." : t("auth.loginBtn")}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-slate-400 text-sm">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          {t("auth.or")}
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {t("auth.google")}
          </button>
          <button
            disabled
            className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium opacity-50 cursor-not-allowed"
          >
            {t("auth.apple")}
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-slate-500">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-primary-600 font-medium">
            {t("nav.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
