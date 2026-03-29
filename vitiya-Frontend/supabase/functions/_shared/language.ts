/** Map app language codes to explicit LLM prompt labels (Indian languages). */
export function responseLanguageLabel(code: unknown): string {
  const raw = typeof code === "string" ? code : "en";
  const c = raw.toLowerCase().trim().split(/[-_]/)[0];
  const map: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    ml: "Malayalam",
    gu: "Gujarati",
    bn: "Bengali",
    pa: "Punjabi",
    ur: "Urdu",
    or: "Odia",
    as: "Assamese",
  };
  return map[c] ?? "English";
}
