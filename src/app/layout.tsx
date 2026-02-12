import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleLayer AI",
  description: "Deconstruct your outfit into a high-fashion layout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
