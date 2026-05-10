import "./globals.css";
import ScrollShell from "./scroll-shell";

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
