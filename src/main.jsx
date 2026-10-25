import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./lib/i18n"; // <-- обязательно

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
