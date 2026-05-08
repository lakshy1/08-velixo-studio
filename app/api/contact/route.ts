import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in the required fields." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message:
        "Thanks. Your inquiry has been received and is ready to be wired into EmailJS, Formspree, or a backend inbox when you add provider credentials.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not process the contact request.",
      },
      { status: 500 },
    );
  }
}
