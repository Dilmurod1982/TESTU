import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-950/40 dark:via-slate-950 dark:to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow"
              >
                {t("hero.ctaRegister")}
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("hero.ctaLogin")}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl flex items-center justify-center">
              <span className="text-white/90 text-6xl font-extrabold tracking-tighter">
                TESTU
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24"
      >
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["f1", "f2", "f3", "f4", "f5", "f6"].map((k) => (
            <div
              key={k}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold mb-4">
                ✓
              </div>
              <h3 className="font-semibold text-lg">
                {t(`features.${k}.title`)}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t(`features.${k}.text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="bg-slate-50 dark:bg-slate-900/50 py-16 md:py-24"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">{t("about.title")}</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t("about.text")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-10 md:p-16 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-white/80">{t("cta.text")}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-primary-700 font-semibold hover:bg-slate-100 transition"
            >
              {t("cta.register")}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-white/40 font-semibold hover:bg-white/10 transition"
            >
              {t("cta.login")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
