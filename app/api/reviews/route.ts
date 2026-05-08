import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      company?: string;
      text?: string;
      rating?: number;
    };

    if (!body.text?.trim()) {
      return NextResponse.json(
        { error: "A review message is required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Review accepted. Connect Supabase or Firebase next if you want permanent storage.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not save the review.",
      },
      { status: 500 },
    );
  }
}
