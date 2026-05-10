import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, buildAdminCookieValue, getAdminSecret } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() || "";
    const secret = getAdminSecret();

    if (!secret) {
      return NextResponse.json(
        { error: "Admin secret is not configured." },
        { status: 500 },
      );
    }

    if (!password || password !== secret) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, buildAdminCookieValue(secret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not start the admin session.",
      },
      { status: 500 },
    );
  }
}
