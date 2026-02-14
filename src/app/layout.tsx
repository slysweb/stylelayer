import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleLayer AI | Pro Flat Lay & Product Extraction Tool",
  description:
    "Automatically extract clothes, shoes, bags, and furniture from photos. Create clean, minimalist product images for OOTD, Etsy, and social media. Fast, AI-powered deconstruction.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "StyleLayer AI | Pro Flat Lay & Product Extraction Tool",
    description:
      "Automatically extract clothes, shoes, bags, and furniture from photos. Create clean, minimalist product images for OOTD, Etsy, and social media.",
    type: "website",
  },
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
