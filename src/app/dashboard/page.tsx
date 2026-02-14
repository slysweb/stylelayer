import { getSession } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/users";
import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Generation = {
  id: string;
  type: string;
  original_url: string;
  result_url: string | null;
  status: string;
  prompt_used: string | null;
  credits_spent: number;
  created_at: string;
};

type CreditLog = {
  id: number;
  amount: number;
  action_type: string;
  description: string | null;
  created_at: string;
};

async function getUserGenerations(googleId: string): Promise<Generation[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .prepare(
      "SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
    )
    .bind(googleId)
    .all();
  return (result.results ?? []) as Generation[];
}

async function getUserCreditLogs(googleId: string): Promise<CreditLog[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .prepare(
      "SELECT * FROM credit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
    )
    .bind(googleId)
    .all();
  return (result.results ?? []) as CreditLog[];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/** Map Chinese API prompts to English display labels */
const PROMPT_DISPLAY_MAP: Record<string, string> = {
  "提取出图片中的衣服、帽子、鞋子和包，生成一张平铺图，背景为纯白色。": "Full Outfit — clothes, hat, shoes & bag",
  "提取出图片中的一双鞋子，生成一张正45度图，背景为纯白色。": "Shoes",
  "提取出图片中的完整的包包和包带，正视图，背景为纯白色。": "Bag & Handbag",
  "提取出图片中的完整的沙发，生成一张正视图，背景为纯白色。": "Sofa & Furniture",
  "提取出图片中的日用品，生成一张正视图，背景为纯白色。": "Daily Essentials",
  "提取出图片中的饰品，生成一张正视图，背景为纯白色。": "Accessories & Jewelry",
};

/** Known Chinese keywords that map to preset types (to avoid showing as Custom) */
const KNOWN_KEYWORDS: Record<string, string> = {
  "衣服、帽子、鞋子和包": "Full Outfit — clothes, hat, shoes & bag",
  "一双鞋子": "Shoes",
  "完整的包包和包带": "Bag & Handbag",
  "完整的沙发": "Sofa & Furniture",
  "日用品": "Daily Essentials",
  "饰品": "Accessories & Jewelry",
};

function displayPrompt(prompt: string | null): string {
  if (!prompt) return "—";
  // Exact match to preset prompts
  if (PROMPT_DISPLAY_MAP[prompt]) return PROMPT_DISPLAY_MAP[prompt];
  // Custom prompts: extract user input from "提取出图片中的XXX，..."
  const match = prompt.match(/提取出图片中的(.+?)，/);
  if (match) {
    const userInput = match[1];
    // Check if it accidentally matches a known preset keyword
    if (KNOWN_KEYWORDS[userInput]) return KNOWN_KEYWORDS[userInput];
    // Show the user's custom input directly
    return `Custom: ${userInput}`;
  }
  return "Custom";
}

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

function creditBadge(actionType: string) {
  switch (actionType) {
    case "ONBOARDING":
      return "bg-blue-50 text-blue-700";
    case "GENERATION":
      return "bg-stone-100 text-stone-600";
    case "REFUND":
      return "bg-emerald-50 text-emerald-700";
    case "PURCHASE":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-stone-50 text-stone-600";
  }
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/sign-in?from=/dashboard");

  const dbUser = await getUserByGoogleId(user.id);
  const generations = await getUserGenerations(user.id);
  const creditLogs = await getUserCreditLogs(user.id);

  const completedCount = generations.filter((g) => g.status === "COMPLETED").length;
  const totalSpent = generations
    .filter((g) => g.status === "COMPLETED")
    .reduce((sum, g) => sum + g.credits_spent, 0);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image
              src="/logo.jpeg"
              alt="StyleLayer AI"
              width={814}
              height={138}
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Welcome back, {user.name}
          </p>
        </div>

        {/* Stats cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Profile card */}
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-lg font-semibold text-stone-600">
                {user.name?.[0] ?? "?"}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-stone-400">{user.email}</p>
            </div>
          </div>

          {/* Credits */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Credits Balance
            </p>
            <p className="mt-2 text-3xl font-bold text-stone-900">
              {dbUser?.credits_balance ?? 0}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Plan: {dbUser?.plan ?? "FREE"}
            </p>
          </div>

          {/* Generations */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Generations
            </p>
            <p className="mt-2 text-3xl font-bold text-stone-900">
              {completedCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              completed images
            </p>
          </div>

          {/* Credits used */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Credits Used
            </p>
            <p className="mt-2 text-3xl font-bold text-stone-900">
              {totalSpent}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              total spent
            </p>
          </div>
        </div>

        {/* Quick action */}
        <div className="mb-10 flex items-center justify-between rounded-2xl bg-stone-900 px-6 py-5 text-white shadow-sm">
          <div>
            <p className="font-semibold">Ready to create something new?</p>
            <p className="mt-0.5 text-sm text-stone-400">
              Upload a photo and generate a professional flat lay in seconds.
            </p>
          </div>
          <Link
            href="/generate"
            className="flex-shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100"
          >
            Generate
          </Link>
        </div>

        {/* Generation history */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Generation History</h2>
          {generations.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-stone-400">
                No generations yet. Create your first flat lay!
              </p>
              <Link
                href="/generate"
                className="mt-4 inline-block rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Image preview */}
                  <div className="grid grid-cols-2">
                    <div className="relative h-36 bg-stone-50">
                      <div className="absolute left-2 top-2 z-10 rounded bg-stone-900/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Original
                      </div>
                      <img
                        src={gen.original_url}
                        alt="Original"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="relative h-36 bg-stone-50">
                      <div className="absolute left-2 top-2 z-10 rounded bg-stone-900/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Result
                      </div>
                      {gen.result_url ? (
                        <img
                          src={gen.result_url}
                          alt="Result"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xs text-stone-300">
                            {gen.status === "PENDING" ? "Processing..." : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(gen.status)}`}
                      >
                        {gen.status}
                      </span>
                      <span className="text-xs text-stone-400">
                        {gen.credits_spent} credit{gen.credits_spent !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {gen.prompt_used && (
                      <p className="mt-2 line-clamp-2 text-xs text-stone-500">
                        {displayPrompt(gen.prompt_used)}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-stone-400">
                      {formatDate(gen.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Credit transaction log */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Credit History</h2>
          {creditLogs.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-stone-400">No credit transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Type
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Amount
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400 sm:table-cell">
                      Description
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {creditLogs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-stone-50/50">
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${creditBadge(log.action_type)}`}
                        >
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-semibold ${
                            log.amount > 0 ? "text-emerald-600" : "text-stone-600"
                          }`}
                        >
                          {log.amount > 0 ? "+" : ""}
                          {log.amount}
                        </span>
                      </td>
                      <td className="hidden max-w-[240px] truncate px-5 py-3 text-stone-500 sm:table-cell">
                        {log.description ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-stone-400">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
