import type { Metadata } from "next";
import AgencyHome from "./agency-home";
import { getSiteContent } from "@/lib/supabase-db";
import { defaultSiteContent } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const content = await getSiteContent("published");

    return {
      metadataBase: new URL("https://nexvora.com"),
      title: content.metadata.title,
      description: content.metadata.description,
      alternates: {
        canonical: content.metadata.canonical,
      },
      openGraph: {
        title: content.metadata.ogTitle,
        description: content.metadata.ogDescription,
        url: "https://nexvora.com",
        siteName: content.metadata.siteName,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: content.metadata.ogTitle,
        description: content.metadata.ogDescription,
      },
    };
  } catch {
    return {
      metadataBase: new URL("https://nexvora.com"),
      title: defaultSiteContent.metadata.title,
      description: defaultSiteContent.metadata.description,
    };
  }
}

export default async function HomePage() {
  let content = defaultSiteContent;

  try {
    content = await getSiteContent("published");
  } catch {
    content = defaultSiteContent;
  }

  return <AgencyHome initialContent={content} />;
}
