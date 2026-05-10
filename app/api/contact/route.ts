import { NextResponse } from "next/server";
import { createContactSubmission } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const inquiryType = String(formData.get("inquiryType") || "").trim();
    const attachment = formData.get("attachment");
    const attachmentName =
      attachment instanceof File && attachment.name ? attachment.name : "";

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in the required fields." },
        { status: 400 },
      );
    }

    await createContactSubmission({
      fullName,
      email,
      phone,
      inquiryType,
      subject,
      message,
      attachmentName,
    });

    return NextResponse.json({
      message: "Thanks. Your inquiry has been saved to the Supabase inbox.",
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
