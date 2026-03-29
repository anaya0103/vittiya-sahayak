import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Shield, FileText, TrendingUp, Languages, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";
import { CHAT_LANGUAGES, type ChatLanguageCode, getStoredChatLanguage, setStoredChatLanguage } from "@/lib/chatLanguages";
import { aiDemoBannerText } from "@/lib/aiDemoConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ChatbotFeatureMode = "general" | "scam" | "document" | "investment";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  time: string;
}

interface ChatbotWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  featureMode?: ChatbotFeatureMode;
  onFeatureModeChange?: (mode: ChatbotFeatureMode) => void;
}

const welcomeByMode: Record<ChatbotFeatureMode, string> = {
  general:
    "Namaste! 🙏 I'm your **Vittiya Sahayak** AI assistant. Choose your **reply language** in the bar below, then ask about finance, scams, taxes, or investments.",
  scam:
    "🛡️ **Scam Detector** — Paste a suspicious SMS or describe a call. I'll flag risks; use the language bar so the verdict is in **Hindi, Tamil**, etc.",
  document:
    "📄 **Document Analyzer** — Paste text from a loan letter, policy, or statement. Pick **reply language** below for the summary.",
  investment:
    "📈 **Investment Advisor** — Ask about SIPs, FDs, ELSS, gold. Replies follow the **language** you select below.",
};

const quickByMode: Record<ChatbotFeatureMode, string[]> = {
  general: ["How to save tax? 💰", "Is this SMS a scam? 🔍", "Best FD rates? 📊", "Explain GST to me 📄"],
  scam: ["Paste: fake KYC link SMS", "UPI collect from unknown", "Prize / lottery message"],
  document: ["Home loan sanction letter", "Credit card terms", "Insurance policy clause"],
  investment: ["SIP vs lump sum?", "ELSS for 80C", "Safe FD vs debt funds", "Gold vs index funds"],
};

function ChatbotWidget({
  open: controlledOpen,
  onOpenChange,
  featureMode: controlledFeatureMode,
  onFeatureModeChange,
}: ChatbotWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (!isControlledOpen) setInternalOpen(v);
  };

  const [internalMode, setInternalMode] = useState<ChatbotFeatureMode>("general");
  const isControlledMode = controlledFeatureMode !== undefined;
  const featureMode = isControlledMode ? controlledFeatureMode! : internalMode;
  const setFeatureMode = (m: ChatbotFeatureMode) => {
    onFeatureModeChange?.(m);
    if (!isControlledMode) setInternalMode(m);
  };

  const [chatLang, setChatLang] = useState<ChatLanguageCode>(() => getStoredChatLanguage());
  const [readAloud, setReadAloud] = useState<boolean>(() => {
    try {
      return localStorage.getItem("vs_tts_enabled") === "true";
    } catch {
      return false;
    }
  });

  const { sendMessage, detectScam, analyzeDocument, loading, error } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [docText, setDocText] = useState("");
  const [docType, setDocType] = useState("general");
  const bottomRef = useRef<HTMLDivElement>(null);

  function speechLangFromChatLang(code: ChatLanguageCode): string {
    switch (code) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "ta":
        return "ta-IN";
      case "te":
        return "te-IN";
      case "kn":
        return "kn-IN";
      case "ml":
        return "ml-IN";
      case "gu":
        return "gu-IN";
      case "bn":
        return "bn-IN";
      case "pa":
        return "pa-IN";
      case "ur":
        return "ur-IN";
      case "or":
        return "or-IN";
      case "en":
      default:
        return "en-IN";
    }
  }

  function stripMarkdownForSpeech(text: string): string {
    // Keep it simple: remove common markdown tokens, and drop markdown links.
    return String(text)
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function speakText(text: string) {
    if (!readAloud) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    const clean = stripMarkdownForSpeech(text);
    if (!clean) return;

    // Prevent overlapping speech from previous messages.
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = speechLangFromChatLang(chatLang);
    utter.rate = 1.02;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open, featureMode]);

  useEffect(() => {
    try {
      localStorage.setItem("vs_tts_enabled", String(readAloud));
    } catch {
      /* ignore */
    }
    if (!readAloud && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [readAloud]);

  useEffect(() => {
    // When widget closes, stop any ongoing speech.
    if (!open && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        id: 0,
        role: "bot",
        text: welcomeByMode[featureMode],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
    setDocText("");
  }, [open, featureMode]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const pushUser = (text: string) => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text, time: t }]);
  };

  const pushBot = (text: string, isSample = false) => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text, time: t, isSample }]);
    speakText(text);
  };

  const demoBanner = aiDemoBannerText();

  const handleGeneralSend = async (text: string) => {
    if (!text.trim()) return;
    pushUser(text.trim());
    setInput("");
    const result = await sendMessage(text.trim(), chatLang);
    if (result?.reply) {
      pushBot(result.reply, Boolean(result.fromDemo));
    } else {
      pushBot("Couldn't reach the AI service. Check your connection and Supabase Edge Functions, or try again.");
    }
  };

  const handleScamSend = async () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    const outcome = await detectScam(text, chatLang);
    if (outcome.ok) {
      const result = outcome.data;
      const verdict = result.isFraud ? "⚠️ **Likely fraud / high risk**" : "✅ **Lower risk** (still stay cautious)";
      const pct =
        result.confidence <= 1 ? Math.round(result.confidence * 100) : Math.min(Math.round(result.confidence), 100);
      const body = `🛡️ **Scam check**\n\n${verdict}\n**Confidence:** ${pct}%\n\n${result.explanation}`;
      const isSample = "fromDemo" in outcome && outcome.fromDemo === true;
      pushBot(body, isSample);
    } else {
      pushBot(`Scam check couldn’t complete.\n\n**Details:** ${outcome.message}`);
    }
  };

  const handleDocumentAnalyze = async () => {
    const text = docText.trim();
    if (!text) {
      toast.message("Paste some document text first");
      return;
    }
    pushUser(`[Document — ${docType}]\n${text.slice(0, 500)}${text.length > 500 ? "…" : ""}`);
    setDocText("");
    const result = await analyzeDocument(text, docType, chatLang);
    if (result) {
      const points = result.keyPoints?.length ? `\n\n**Key points:**\n${result.keyPoints.map((p) => `• ${p}`).join("\n")}` : "";
      pushBot(`📄 **Summary (${result.documentType || docType})**\n\n${result.summary}${points}`, Boolean(result.fromDemo));
    } else {
      pushBot("Document analysis failed. Check your text length and try again.");
    }
  };

  const headerIcon = () => {
    switch (featureMode) {
      case "scam":
        return <Shield size={20} />;
      case "document":
        return <FileText size={20} />;
      case "investment":
        return <TrendingUp size={20} />;
      default:
        return <Bot size={20} />;
    }
  };

  const headerTitle =
    featureMode === "scam"
      ? "Scam Detector"
      : featureMode === "document"
        ? "Document Analyzer"
        : featureMode === "investment"
          ? "Investment Advisor"
          : "Vittiya Sahayak AI";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-foreground/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform animate-float"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] sm:w-[400px] max-h-[80vh] flex flex-col rounded-2xl border-2 border-border bg-card shadow-2xl overflow-hidden animate-scale-in">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">{headerIcon()}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-sm truncate">{headerTitle}</h3>
              <p className="text-xs opacity-80 truncate">Your financial buddy</p>
            </div>
            <Sparkles size={18} className="opacity-60 shrink-0" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
            <Languages size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-body font-semibold text-muted-foreground shrink-0">
              Reply in
            </span>
            <Select
              value={chatLang}
              onValueChange={(v) => {
                const c = v as ChatLanguageCode;
                setChatLang(c);
                setStoredChatLanguage(c);
              }}
            >
              <SelectTrigger className="h-8 text-xs rounded-lg flex-1 min-w-0 border-border bg-background">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {CHAT_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant={readAloud ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => setReadAloud((v) => !v)}
              aria-label={readAloud ? "Disable read aloud" : "Enable read aloud"}
              title={readAloud ? "Read aloud: ON" : "Read aloud: OFF"}
            >
              {readAloud ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
          </div>

          {demoBanner && (
            <div className="px-3 py-2 text-[10px] sm:text-xs font-body leading-snug bg-amber-500/15 text-amber-950 dark:text-amber-100 border-b border-amber-500/30">
              {demoBanner}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[220px] max-h-[42vh]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "bot" ? "bg-primary/15 text-primary" : "bg-accent/30 text-accent-foreground"
                  }`}
                >
                  {msg.role === "bot" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm font-body whitespace-pre-line ${
                    msg.role === "bot" ? "bg-muted text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  {msg.text}
                  {msg.isSample && (
                    <span className="block text-[10px] font-semibold text-amber-700 dark:text-amber-300 mt-2 pt-1 border-t border-border/60">
                      Sample response — not from live AI
                    </span>
                  )}
                  <span className="block text-[10px] opacity-50 mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
            {quickByMode[featureMode].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  if (featureMode === "document") {
                    setDocText((prev) => (prev ? `${prev}\n${q}` : q));
                  } else {
                    setInput(q);
                  }
                }}
                className="whitespace-nowrap text-xs font-body font-semibold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {featureMode === "document" ? (
            <div className="border-t border-border p-3 space-y-2">
              <Textarea
                placeholder="Paste loan letter, policy text, or statement excerpts…"
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                className="rounded-xl text-sm min-h-[100px] resize-y font-body"
                disabled={loading}
              />
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Type (e.g. loan, insurance)"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="rounded-xl text-sm flex-1"
                  disabled={loading}
                />
                <Button type="button" className="rounded-xl shrink-0" disabled={loading || !docText.trim()} onClick={handleDocumentAnalyze}>
                  Analyze
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (featureMode === "scam") void handleScamSend();
                else void handleGeneralSend(input);
              }}
              className="border-t border-border p-3 flex gap-2"
            >
              <Input
                placeholder={
                  featureMode === "scam"
                    ? "Paste SMS or describe the call…"
                    : featureMode === "investment"
                      ? "Ask about SIPs, FDs, ELSS, gold…"
                      : "Ask anything about finance…"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-xl text-sm"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={!input.trim() || loading}>
                <Send size={16} />
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
