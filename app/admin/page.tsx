import { isAdminSessionActive } from "@/lib/admin-session";
import { defaultSiteContent } from "@/lib/site-content";
import {
  getAdminDashboardCounts,
  getSiteContent,
  listContactSubmissions,
} from "@/lib/supabase-db";
import AdminLogin from "./admin-login";
import AdminStudio, { type ContactSubmission } from "./admin-studio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await isAdminSessionActive();

  if (!isAuthed) {
    return <AdminLogin />;
  }

  let draft = defaultSiteContent;
  let published = defaultSiteContent;
  let metrics = {
    reviews: 0,
    contacts: 0,
    lastUpdated: new Date().toISOString(),
  };
  let submissions: ContactSubmission[] = [];
  let offlineMessage = "";

  try {
    const [loadedDraft, loadedPublished, loadedMetrics, loadedSubmissions] =
      await Promise.all([
        getSiteContent("draft"),
        getSiteContent("published"),
        getAdminDashboardCounts(),
        listContactSubmissions(),
      ]);

    draft = loadedDraft;
    published = loadedPublished;
    metrics = loadedMetrics;
    submissions = loadedSubmissions;
  } catch (error) {
    offlineMessage =
      error instanceof Error
        ? error.message
        : "Supabase is not reachable right now, so the studio is using local fallback content.";
  }

  return (
    <AdminStudio
      key={metrics.lastUpdated}
      initialDraft={draft}
      published={published}
      metrics={metrics}
      submissions={submissions}
      offlineMessage={offlineMessage}
    />
  );
}
