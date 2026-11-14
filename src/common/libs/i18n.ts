import { createI18n } from "vue-i18n";
import en from "@/common/locales/en";
import zhHans from "@/common/locales/zh-Hans";
import { VITE_DEFAULT_LOCALES, VITE_FALLBACK_LOCALES } from "./env";

const locale = VITE_DEFAULT_LOCALES;
const fallbackLocale = VITE_FALLBACK_LOCALES;

if (!locale) {
  throw new Error("VITE_DEFAULT_LOCALES is required");
}

if (!fallbackLocale) {
  throw new Error("VITE_FALLBACK_LOCALES is required");
}

export const i18n = createI18n({
  locale,
  fallbackLocale,
  messages: {
    en,
    "zh-Hans": zhHans,
  },
});
