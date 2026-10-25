import { useTranslation } from "react-i18next";

const langs = [
  { key: "uzLatn", label: "UZ" },
  { key: "uzCyrl", label: "ЎЗ" },
  { key: "ru", label: "RU" },
  { key: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const change = async (lng) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem("testu-lang", lng);
  };

  // i18n.language — то, что запросили; resolvedLanguage — что реально применилось.
  // Для подсветки используем language, чтобы кнопка реагировала сразу.
  const active = i18n.language;

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      {langs.map((l) => (
        <button
          key={l.key}
          type="button"
          onClick={() => change(l.key)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition ${
            active === l.key
              ? "bg-white dark:bg-slate-700 shadow"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
