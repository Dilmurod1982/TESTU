import { useMemo, useState } from "react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => (o.label || "").toLowerCase().includes(q));
  }, [options, search]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((v) => !v);
          setSearch("");
        }}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {selected ? selected.label : placeholder}
        <span className="float-right text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input
              autoFocus
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-slate-500">
                Ничего не найдено
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      o.value === value
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : ""
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
