import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

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

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-stone-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-stone-900">Dashboard</h2>
          <p className="mt-2 text-sm text-stone-500">
            Welcome{userId ? " back" : ""}. Your generated layouts will appear here.
          </p>
          <Link
            href="/generate"
            className="mt-6 inline-block rounded-md border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Go to Generate
          </Link>
        </div>
      </main>
    </div>
  );
}
