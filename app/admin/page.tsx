import { isAdminSessionActive } from "@/lib/admin-session";
import {
  getAdminDashboardCounts,
  getSiteContent,
  listContactSubmissions,
} from "@/lib/supabase-db";
import AdminLogin from "./admin-login";
import AdminStudio from "./admin-studio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await isAdminSessionActive();

  if (!isAuthed) {
    return <AdminLogin />;
  }

  const [draft, published, metrics, submissions] = await Promise.all([
    getSiteContent("draft"),
    getSiteContent("published"),
    getAdminDashboardCounts(),
    listContactSubmissions(),
  ]);

  return (
    <AdminStudio
      key={metrics.lastUpdated}
      initialDraft={draft}
      published={published}
      metrics={metrics}
      submissions={submissions}
    />
  );
}
