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
    const { message, language = "en" } = await req.json();

    if (!message) {
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
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const lang = responseLanguageLabel(language);

    const systemPrompt = `You are Vittiya Sahayak, a friendly financial co-pilot for people in India.
- Help with savings, taxes, SIPs, FDs, insurance, UPI safety, and avoiding scams — in plain language.
- Use simple analogies; avoid unexplained jargon. Mention that a SEBI-registered advisor or CA should be consulted for big decisions.
- You MUST write the full answer in ${lang}. If the user writes in another script or language, still reply in ${lang} unless they explicitly ask for a different language.
- Keep answers concise but useful (roughly 3–8 short paragraphs or bullet lists when helpful).`;

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
          { role: "user", content: String(message) },
        ],
        temperature: 0.65,
        max_tokens: 900,
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

    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply, language }),
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
