import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { responseLanguageLabel } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { documentText, documentType = "general", language = "en" } = await req.json();

    if (!documentText) {
      return new Response(
        JSON.stringify({ error: "Document text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const lang = responseLanguageLabel(language);

    let systemPrompt = `You are a financial document simplifier for Indian users.
Simplify complex financial documents into easy-to-understand language.
You MUST write the entire response in ${lang}.

Extract and explain (use clear headings or bullets):
1. Main purpose of the document
2. Key figures/amounts
3. Important dates
4. What the user needs to do
5. Any risks or terms to watch

Use everyday words; this is not legal advice — suggest consulting a professional for binding decisions.`;

    if (documentType === "bank_statement") {
      systemPrompt += "\nFocus on: Total balance, major transactions, fees, and overdraft risks.";
    } else if (documentType === "insurance") {
      systemPrompt += "\nFocus on: Coverage amount, premium, exclusions, and claim process.";
    } else if (documentType === "loan_document") {
      systemPrompt += "\nFocus on: Interest rate, monthly EMI, tenure, and hidden charges.";
    } else if (documentType === "tax_form") {
      systemPrompt += "\nFocus on: Income reported, deductions, tax owed/refund, and filing deadline.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Please simplify and explain this financial document:\n\n${String(documentText).slice(0, 12000)}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "OpenAI API error" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const summary = data.choices[0]?.message?.content || "Unable to analyze document.";

    const keyPoints = extractKeyPoints(summary);

    return new Response(
      JSON.stringify({
        summary,
        keyPoints,
        language,
        documentType,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const err = error as { message?: string };
    return new Response(
      JSON.stringify({ error: err.message ?? String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function extractKeyPoints(text: string): string[] {
  const points: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("-") || t.startsWith("•") || /^\d+\./.test(t)) {
      const point = t.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (point && point.length > 10) {
        points.push(point);
      }
    }
  }

  return points.slice(0, 8);
}
