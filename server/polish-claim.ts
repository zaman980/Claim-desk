export const MAX_INPUT_LENGTH = 600;

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

export async function handlePolishRequest(
  request: Request,
  apiKey: string | undefined
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!apiKey) {
    return json(
      {
        error:
          "AI assistant isn't configured. Add GEMINI_API_KEY to your .env.local " +
          "file (locally) or your Vercel project's Environment Variables (deployed).",
      },
      501
    );
  }

  let body: { description?: unknown; claimType?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const claimType = typeof body.claimType === "string" ? body.claimType : "auto";

  if (!description) {
    return json({ error: "Please write a brief description first." }, 400);
  }
  if (description.length > MAX_INPUT_LENGTH) {
    return json({ error: "That's a bit long — try trimming it down first." }, 400);
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You rewrite short, informal insurance claim descriptions into a " +
                  "single clear, factual, professional sentence suitable for a " +
                  "claims processing system. Keep the original meaning and facts " +
                  "exactly — don't invent dates, amounts, locations, or details " +
                  "that weren't given, and don't speculate about fault or cause " +
                  "beyond what's stated. Output only the rewritten sentence, " +
                  "nothing else: no quotes, no preamble, no explanation.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: `Claim type: ${claimType}\nDescription: ${description}` },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.4,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      console.error(
        `Gemini API error (${geminiResponse.status}) for model "${GEMINI_MODEL}":`,
        detail
      );
      return json({ error: "The AI assistant is temporarily unavailable." }, 502);
    }

    const data = await geminiResponse.json();
    const polished: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?.trim()
      ?.replace(/^[\"']|[\"']$/g, "");

    if (!polished) {
      return json({ error: "The AI assistant didn't return a result." }, 502);
    }

    return json({ polished }, 200);
  } catch (err) {
    console.error("polish-claim-description failed:", err);
    return json({ error: "The AI assistant is temporarily unavailable." }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
