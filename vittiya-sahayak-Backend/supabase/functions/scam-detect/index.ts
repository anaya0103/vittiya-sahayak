import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { responseLanguageLabel } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ScamAnalysis = {
  isFraud: boolean;
  confidence: number;
  explanation: string;
};

function normalizeAnalysis(raw: Record<string, unknown>): ScamAnalysis {
  const fraud = raw.isFraud ?? raw.is_fraud ?? raw.fraud;
  let confidence = Number(raw.confidence ?? raw.score ?? 0);
  if (Number.isNaN(confidence)) confidence = 0;
  if (confidence > 0 && confidence <= 1) confidence = Math.round(confidence * 100);
  confidence = Math.min(100, Math.max(0, confidence));
  const explanation =
    typeof raw.explanation === "string"
      ? raw.explanation
      : typeof raw.message === "string"
        ? raw.message
        : "Analysis incomplete.";
  return {
    isFraud: Boolean(fraud),
    confidence,
    explanation,
  };
}

/** OpenAI often wraps JSON in markdown fences; extract and parse. */
function parseScamJsonFromModel(text: string): ScamAnalysis | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    const o = JSON.parse(candidate) as Record<string, unknown>;
    return normalizeAnalysis(o);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const o = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
        return normalizeAnalysis(o);
      } catch {
        return null;
      }
    }
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, language = "en" } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI API key not configured. Set OPENAI_API_KEY in Supabase: Project Settings → Edge Functions → Secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const langHint = responseLanguageLabel(language);

    const systemPrompt = `You are a fraud detection expert for financial SMS, UPI messages, and phone scams in India.
Analyze the message and decide if it is likely a scam.

Return ONLY a JSON object with these exact keys:
- "isFraud": boolean
- "confidence": integer from 0 to 100 (how sure you are)
- "explanation": one short paragraph in ${langHint} (natural wording for Indian users)

Patterns to treat as high risk: fake KYC links, unknown UPI collect, lottery wins, requests for OTP/PIN, shortened suspicious URLs, impersonation of banks.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this message for fraud:\n\n"""${message.slice(0, 8000)}"""`,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || data.error || "OpenAI API error",
        }),
        {
          status: response.status >= 400 ? response.status : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const analysisText = data.choices[0]?.message?.content || "";
    const parsed = parseScamJsonFromModel(analysisText);

    const analysis: ScamAnalysis = parsed ?? {
      isFraud: false,
      confidence: 0,
      explanation: analysisText || "Unable to analyze message.",
    };

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
