/** Language codes sent to Edge Functions (`language` JSON field). */
export const CHAT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
] as const;

export type ChatLanguageCode = (typeof CHAT_LANGUAGES)[number]["code"];

const STORAGE_KEY = "vs_chat_language";

export function getStoredChatLanguage(): ChatLanguageCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && CHAT_LANGUAGES.some((x) => x.code === v)) return v as ChatLanguageCode;
  } catch {
    /* ignore */
  }
  return "en";
}

export function setStoredChatLanguage(code: ChatLanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}
