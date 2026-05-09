import type { Metadata } from "next";
import "./globals.css";
import ScrollShell from "./scroll-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://nexvora.com"),
  title: "Nexvora - Web Design, App Development & AI Solutions Agency",
  description:
    "Nexvora is a full-service digital agency offering web design, app development, SaaS, AI integration, SEO, and cloud services.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nexvora - Web Design, App Development & AI Solutions Agency",
    description:
      "Design. Development. AI. Cloud. A premium digital agency website built to convert.",
    url: "https://nexvora.com",
    siteName: "Nexvora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexvora - Web Design, App Development & AI Solutions Agency",
    description:
      "A dark luxury digital agency site with full-service capabilities and an AI concierge.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full overflow-hidden flex flex-col">
        <ScrollShell>{children}</ScrollShell>
      </body>
    </html>
  );
}
