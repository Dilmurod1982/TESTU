import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export default function PublicLayout() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo />

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary-600 transition">
              {t("nav.features")}
            </a>
            <a href="#about" className="hover:text-primary-600 transition">
              {t("nav.about")}
            </a>
            <a href="#contact" className="hover:text-primary-600 transition">
              {t("nav.contact")}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t("nav.login")}
            </Link>

            <Link
              to="/register"
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition shadow-sm"
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer
        id="contact"
        className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t("footer.contacts")}
            </h4>
            <p>dilik@mail.ru</p>
            <p>+998 00 000 00 00</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t("footer.legal")}
            </h4>
            <p>© {new Date().getFullYear()} TESTU</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
