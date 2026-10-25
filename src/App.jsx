import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { useThemeStore, applyTheme } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <AppRouter />;
}
