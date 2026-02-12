import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/generate");
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            StyleLayer AI
          </h1>
          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Deconstruct your outfit into a high-fashion layout
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-500">
            Upload a photo, choose your extraction type, and generate professional
            product-style images with AI. Perfect for fashion, accessories, and more.
          </p>
          <Link
            href="/sign-in"
            className="mt-10 inline-block rounded-lg border border-stone-900 bg-stone-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-stone-800"
          >
            Get started
          </Link>
          <p className="mt-4 text-sm text-stone-400">
            Sign in with Google or Apple
          </p>
        </div>
      </main>
    </div>
  );
}
