import { useThemeStore } from "../../store/themeStore";

const themes = [
  { key: "light", label: "☀️" },
  { key: "dark", label: "🌙" },
  { key: "system", label: "💻" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      {themes.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          title={t.key}
          className={`px-2 py-1 rounded-md text-sm transition ${
            theme === t.key
              ? "bg-white dark:bg-slate-700 shadow"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
