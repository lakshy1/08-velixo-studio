import { NextResponse } from "next/server";
import { isAdminSessionActive } from "@/lib/admin-session";
import {
  getSiteContent,
  publishSiteDraft,
  saveSiteDraft,
} from "@/lib/supabase-db";
import { normalizeSiteContent, type SiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    if (!(await isAdminSessionActive())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await getSiteContent("draft");
    const published = await getSiteContent("published");

    return NextResponse.json({
      draft,
      published,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not load the content workspace.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminSessionActive())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      action?: "save" | "publish";
      content?: Partial<SiteContent>;
    };

    const action = body.action ?? "save";
    const content = normalizeSiteContent(body.content);

    await saveSiteDraft(content);

    if (action === "publish") {
      await publishSiteDraft();
    }

    return NextResponse.json({
      ok: true,
      action,
      content,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not save the content workspace.",
      },
      { status: 500 },
    );
  }
}
