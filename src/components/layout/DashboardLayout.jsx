import { Link, useNavigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useAuthStore } from "../../store/authStore";
import { logout } from "../../services/authService";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <Logo to={`/${role || ""}`} />
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link
            to={`/${role || ""}`}
            className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t("dashboard.home")}
          </Link>
          <Link
            to="/account/password"
            className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Сменить пароль
          </Link>
          <span className="block px-3 py-2 text-xs uppercase text-slate-400 mt-4">
            {role}
          </span>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {t("dashboard.logout")}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="md:hidden">
            <Logo to={`/${role || ""}`} />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="md:hidden px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {t("dashboard.logout")}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
