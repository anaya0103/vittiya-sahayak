/** Labeled offline / quota-exhausted demos — never pretend to be live AI. */

export function isAiDemoOnly(): boolean {
  return import.meta.env.VITE_AI_DEMO_MODE === "true";
}

export function isAiDemoFallback(): boolean {
  return import.meta.env.VITE_AI_DEMO_FALLBACK === "true";
}

export function aiDemoBannerText(): string | null {
  if (isAiDemoOnly()) {
    return "Offline demo: sample responses only — not from a live AI API.";
  }
  if (isAiDemoFallback()) {
    return "If the live API fails or hits limits, sample responses may be shown (see labels on replies).";
  }
  return null;
}
