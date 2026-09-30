import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import ScrollShell from "./scroll-shell";

// Body and UI in Inter; display type in Inter Tight, set semi-bold with tight tracking.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter-tight", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full overflow-hidden flex flex-col">
        <ScrollShell>{children}</ScrollShell>
      </body>
    </html>
  );
}
