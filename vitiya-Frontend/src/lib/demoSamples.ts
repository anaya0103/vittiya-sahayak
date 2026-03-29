export interface ChatResponse {
  reply: string;
  language: string;
  fromDemo?: true;
}

export interface DocumentAnalysisResponse {
  summary: string;
  keyPoints: string[];
  language: string;
  documentType: string;
  fromDemo?: true;
}

function normLang(code: string): string {
  return (code || "en").toLowerCase().split(/[-_]/)[0];
}

/** Scam sample — structured for UI (explanation goes below confidence in widget). */
function sampleScam(message: string, language: string): { isFraud: boolean; confidence: number; explanation: string } {
  const lang = normLang(language);
  const m = message.toLowerCase();
  const matchesPrepared =
    /blocked|fake-kyc|fake kyc|verify.*http|account.*block/i.test(message) ||
    m.includes("fake-kyc") ||
    m.includes("phishing");

  if (lang === "hi" && matchesPrepared) {
    return {
      isFraud: true,
      confidence: 0.93,
      explanation:
        "कारण:\n- तत्काल भाषा (\"ब्लॉक हो जाएगा\")\n- संदिग्ध लिंक\n- बैंकिंग फ्रॉड में आम फिशिंग पैटर्न\n\nसलाह: लिंक पर क्लिक न करें। सीधे बैंक से संपर्क करें।",
    };
  }

  if (matchesPrepared) {
    return {
      isFraud: true,
      confidence: 0.92,
      explanation:
        "Reason:\n- Uses urgent language (\"will be blocked\")\n- Contains a suspicious link\n- Common phishing pattern used in banking frauds\n\nAdvice: Do not click on the link. Contact your bank directly.",
    };
  }

  return {
    isFraud: true,
    confidence: 0.78,
    explanation:
      lang === "hi"
        ? "यह संदेश संदिग्ध है। अनजान लिंक, OTP मांग या जल्दी करने का दबाव सामान्य घोटाला संकेत हैं। आधिकारिक ऐप/नंबर से ही पुष्टि करें।"
        : "This message shows common warning signs (urgency, unknown links, or requests for OTP). Treat as suspicious; verify through your bank’s official app or phone number only.",
  };
}

/** General / investment Q&A canned replies (match hackathon script; generic otherwise). */
function sampleChat(message: string, language: string): string {
  const lang = normLang(language);
  const msg = message.trim();

  // Marathi (distinct phrases — Devanagari overlaps with Hindi)
  if (/मला पैसे|गुंतवायचे|गुंतवणूक/i.test(msg)) {
    return (
      "तुम्ही गुंतवणूक करण्यापूर्वी तुमचे उद्दिष्ट ठरवले पाहिजे.\n\n" +
      "• लहान रकमेपासून सुरुवात करा\n" +
      "• SIP किंवा म्युच्युअल फंड विचारात घ्या\n" +
      "• जोखीम समजून घ्या\n\n" +
      "नियमित गुंतवणूक केल्याने चांगला परतावा मिळू शकतो.\n\n" +
      "_मोठ्या निर्णयांसाठी पात्र सल्लागाराशी चर्चा करा._"
    );
  }

  if (lang === "mr") {
    return (
      "हे एक डेमो उत्तर आहे: लक्ष्य ठरवा, आपत्कालीन निधी तयार ठेवा, आणि गुंतवणुकीपूर्वी जोखीम समजून घ्या.\n\n" +
      "_पूर्ण AI साठी API कनेक्ट करा._"
    );
  }

  if (lang === "hi" || (/[\u0900-\u097F]/.test(msg) && /निवेश|चाहिए|करना/i.test(msg))) {
    if (/निवेश|invest/i.test(msg)) {
      return (
        "आपको निवेश शुरू करने से पहले अपने लक्ष्यों को समझना चाहिए।\n\n" +
        "• छोटे निवेश से शुरुआत करें\n" +
        "• म्यूचुअल फंड या SIP पर विचार करें\n" +
        "• जोखिम को समझकर निवेश करें\n\n" +
        "नियमित और सुरक्षित निवेश करना सबसे अच्छा तरीका है।\n\n" +
        "_बड़े फैसलों के लिए किसी योग्य सलाहकार से चर्चा करें।_"
      );
    }
    return (
      "यह एक डेमो उत्तर है। जीवंत मोड में Edge Functions के जरिए AI जवाब देता है।\n\n" +
      "बचत, कर, बीमा या सेविंग के बारे में संक्षिप्त सलाह: लक्ष्य तय करें, आपात कोष बनाएं, और जोखिम समझकर ही उत्पाद चुनें।"
    );
  }

  if (/invest|sip|fd|mutual fund/i.test(msg)) {
    return (
      "Start with clear goals and an emergency fund, then consider low-cost index funds or SIPs within your risk comfort. " +
      "FDs suit short-term safety; equities need a longer horizon.\n\n" +
      "_For tax or product-specific advice, speak to a SEBI-registered advisor or CA._"
    );
  }

  return (
    "This is a **sample reply** (offline demo). With a live API, Vittiya Sahayak answers via Supabase Edge Functions.\n\n" +
    "Quick tip: build an emergency fund, avoid unsolicited “KYC” links, and compare fees before choosing funds or insurance."
  );
}

function sampleDocument(documentText: string, language: string): DocumentAnalysisResponse {
  const lang = normLang(language);
  const t = documentText.toLowerCase();
  const matchesHackathon =
    t.includes("monthly fee") && (t.includes("suspension") || t.includes("suspend"));

  if (matchesHackathon) {
    const summary =
      lang === "hi"
        ? "📄 सारांश:\n\n• उपयोगकर्ता को मासिक शुल्क देना होगा\n• भुगतान में विफलता से खाता निलंबित हो सकता है\n\n⚠️ समय पर भुगतान करें ताकि सेवा बंद न हो।"
        : "📄 Summary:\n\n• The user must pay a monthly fee\n• Failure to pay may result in account suspension\n\n⚠️ Important: Pay on time to avoid service disruption.";

    const keyPoints =
      lang === "hi"
        ? ["मासिक शुल्क आवश्यक", "देरी पर सेवा बाधित हो सकती है"]
        : ["Monthly payment obligation", "Suspension risk if unpaid"];

    return {
      summary,
      keyPoints,
      language: lang,
      documentType: "general",
      fromDemo: true,
    };
  }

  return {
    summary:
      lang === "hi"
        ? "डेमो विश्लेषण: दस्तावेज़ में शर्तें शुल्क, तिथियाँ, और जोखिम ढूँढ़ें। पूर्ण विश्लेषण के लिए API से कनेक्ट करें।"
        : "Demo analysis: Look for fees, key dates, penalties, and automatic renewals. Connect the live API for full AI simplification.",
    keyPoints:
      lang === "hi"
        ? ["पढ़ें कि रद्दीकरण कैसे काम करता है", "छुपे शुल्क देखें"]
        : ["Check cancellation terms", "Watch for hidden fees"],
    language: lang,
    documentType: "general",
    fromDemo: true,
  };
}

export function getDemoChat(message: string, language: string): ChatResponse {
  return {
    reply: sampleChat(message, language),
    language: normLang(language),
    fromDemo: true,
  };
}

export function getDemoScam(message: string, language: string) {
  const s = sampleScam(message, language);
  return {
    ok: true as const,
    data: {
      isFraud: s.isFraud,
      confidence: s.confidence,
      explanation: s.explanation,
    },
    fromDemo: true as const,
  };
}

export function getDemoDocument(
  documentText: string,
  documentType: string,
  language: string,
): DocumentAnalysisResponse {
  const base = sampleDocument(documentText, language);
  return {
    ...base,
    documentType: documentType || base.documentType,
    fromDemo: true,
  };
}
