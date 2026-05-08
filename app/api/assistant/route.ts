import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Please provide a prompt for the assistant." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
    const temperature = Number(process.env.GROQ_TEMPERATURE || "0.7");
    const maxTokens = Number(process.env.GROQ_MAX_TOKENS || "1024");

    if (!apiKey) {
      return NextResponse.json({
        reply:
          "Studio AI is not configured yet. Add GROQ_API_KEY to `.env.local` and this assistant will generate project briefs, strategy notes, and launch plans.",
      });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "You are Nexvora's AI concierge. Write concise, practical, premium-sounding guidance for agency projects. Answer in 5 to 8 short lines and include next steps, recommended services, and a rough timeline when relevant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Studio AI request failed: ${text}` },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      reply:
        reply ||
        "The assistant returned an empty response. Try adjusting the prompt and submitting again.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assistant could not complete the request.",
      },
      { status: 500 },
    );
  }
}
