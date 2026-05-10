import { NextResponse } from "next/server";
import { isAdminSessionActive } from "@/lib/admin-session";
import { listContactSubmissions } from "@/lib/supabase-db";

export async function GET() {
  try {
    if (!(await isAdminSessionActive())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await listContactSubmissions();

    return NextResponse.json({ submissions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not load submissions.",
      },
      { status: 500 },
    );
  }
}
