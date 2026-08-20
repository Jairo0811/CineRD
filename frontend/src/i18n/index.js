import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

const STORAGE_KEY = "cineRdLanguage";
const storedLanguage = localStorage.getItem(STORAGE_KEY);
const browserLanguage = navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
const initialLanguage = storedLanguage === "en" || storedLanguage === "es" ? storedLanguage : browserLanguage;

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  const normalized = language.startsWith("en") ? "en" : "es";
  localStorage.setItem(STORAGE_KEY, normalized);
  document.documentElement.lang = normalized;
});

document.documentElement.lang = initialLanguage;

export default i18n;
