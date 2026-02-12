import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleLayer AI",
  description: "Deconstruct your outfit into a high-fashion layout",
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Build fails without this; add in Cloudflare Pages → Settings → Environment variables
if (!clerkPublishableKey && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required. " +
      "Add it in Cloudflare Pages: Settings → Environment variables"
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
