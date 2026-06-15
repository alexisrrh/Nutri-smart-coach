import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import i18n from "./i18n";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { initAnalytics } from "./services/analytics";
import { I18nextProvider } from "react-i18next";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA installation should not block app startup.
    });
  });
}
initAnalytics();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);


