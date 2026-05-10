import { NextResponse } from "next/server";
import { createReview, listPublishedReviews } from "@/lib/supabase-db";

export async function GET() {
  try {
    const reviews = await listPublishedReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not load reviews.",
      },
      { status: 500 },
    );
  }
}

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

    await createReview({
      name: body.name,
      company: body.company,
      text: body.text,
      rating: Number(body.rating || 5),
    });

    return NextResponse.json({
      ok: true,
      message: "Review published successfully.",
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
