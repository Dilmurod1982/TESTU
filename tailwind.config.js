export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4ff", 100: "#dbe7ff", 200: "#bdd2ff", 300: "#90b4ff",
          400: "#5c8bff", 500: "#3563ff", 600: "#1f42f5", 700: "#1730e1",
          800: "#1a2bb6", 900: "#1c2b8f", 950: "#111a5a",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};