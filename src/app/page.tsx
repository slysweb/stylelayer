import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { Navigation } from "@/components/navigation";

const FEATURES = [
  {
    title: "Everyday Essentials",
    description:
      "Extract daily-use items from cluttered scenes into clean, catalog-ready flat lays.",
    before: "/images/feature-1.png",
    after: "/images/feature-11.png",
  },
  {
    title: "Furniture & Decor",
    description:
      "Isolate sofas, chairs, and home furnishings for interior design mood boards.",
    before: "/images/feature-2.png",
    after: "/images/feature-21.png",
  },
  {
    title: "Jewelry & Accessories",
    description:
      "Turn accessory photos into polished product shots perfect for e-commerce listings.",
    before: "/images/feature-3.png",
    after: "/images/feature-31.png",
  },
  {
    title: "Bags & Handbags",
    description:
      "Create minimalist product images of bags for Etsy, Shopify, or social media.",
    before: "/images/feature-4.png",
    after: "/images/feature-41.png",
  },
  {
    title: "Shoes & Footwear",
    description:
      "Extract shoes from any photo into studio-quality isolated product shots.",
    before: "/images/feature-5.png",
    after: "/images/feature-51.png",
  },
  {
    title: "Full Outfit (OOTD)",
    description:
      "Deconstruct a full outfit into a professional flat lay layout — head to toe.",
    before: "/images/feature-6.png",
    after: "/images/feature-61.png",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Upload Your Photo",
    description:
      "Drop any image — a selfie, a room photo, or a product shot. No special setup needed.",
  },
  {
    step: "02",
    title: "AI Extraction",
    description:
      "Our AI identifies and isolates each item, removing backgrounds and distractions automatically.",
  },
  {
    step: "03",
    title: "Download & Share",
    description:
      "Get clean, studio-quality flat lay images ready for social media, e-commerce, or design work.",
  },
];

const FAQS = [
  {
    question: "What types of photos work best?",
    answer:
      "StyleLayer works with almost any photo — outfit selfies, room shots, product photos, or casual snaps. For best results, make sure the items you want to extract are clearly visible in the image.",
  },
  {
    question: "How many credits do I get for free?",
    answer:
      "Every new account receives 3 free credits on signup. Each generation costs 1 credit. You can purchase additional credits from your dashboard.",
  },
  {
    question: "What output format do I receive?",
    answer:
      "All generated images are high-resolution PNGs with clean white or transparent backgrounds, perfect for e-commerce listings, social media posts, or design projects.",
  },
  {
    question: "Can I use the images commercially?",
    answer:
      "Yes! All images you generate with StyleLayer are yours to use for any purpose, including commercial use on Etsy, Shopify, Amazon, social media, and more.",
  },
  {
    question: "How long does generation take?",
    answer:
      "Most extractions complete in under 30 seconds. Complex images with many items may take slightly longer.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We take privacy seriously. Uploaded images are processed securely and are not shared with third parties. You can delete your data at any time from your dashboard.",
  },
];

export default async function HomePage() {
  const user = await getSession();

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
              priority
            />
          </Link>
          <Navigation />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
              Turn Any Photo into a<br />
              <span className="text-stone-500">Professional Flat Lay</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 sm:text-xl">
              Extract clothing, accessories, and home decor from images with one
              click. Studio-quality product shots, powered by AI.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={user ? "/generate" : "/sign-in"}
                className="inline-flex items-center rounded-lg bg-stone-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
              >
                {user ? "Start Generating" : "Get Started Free"}
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              {!user && (
                <p className="text-sm text-stone-400">
                  No credit card required &middot; 3 free credits
                </p>
              )}
            </div>
          </div>

          {/* Hero preview — show first feature as before/after */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="absolute left-3 top-3 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Before
                </div>
                <Image
                  src="/images/feature-6.png"
                  alt="Original outfit photo"
                  width={600}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="absolute left-3 top-3 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  After
                </div>
                <Image
                  src="/images/feature-61.png"
                  alt="AI extracted flat lay"
                  width={600}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-stone-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">
              Simple Process
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-12">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-lg font-bold text-stone-900">
                  {item.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Before / After Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">
            What You Can Extract
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Works With Everything
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500">
            From full outfits to individual accessories, furniture to everyday
            items — StyleLayer handles it all.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Before / After images */}
              <div className="relative grid grid-cols-2">
                <div className="relative">
                  <div className="absolute left-2 top-2 z-10 rounded bg-stone-900/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    Before
                  </div>
                  <Image
                    src={feature.before}
                    alt={`${feature.title} — original`}
                    width={300}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-2 top-2 z-10 rounded bg-stone-900/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    After
                  </div>
                  <Image
                    src={feature.after}
                    alt={`${feature.title} — extracted`}
                    width={300}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-stone-200/80 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">
              FAQ
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-12 divide-y divide-stone-200">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group py-5"
              >
                <summary className="flex cursor-pointer items-center justify-between text-left font-medium text-stone-900 transition-colors hover:text-stone-600">
                  {faq.question}
                  <svg
                    className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-stone-900 px-8 py-16 text-center shadow-xl sm:px-16">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to Create Stunning Flat Lays?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-400">
            Join thousands of creators, stylists, and e-commerce sellers who use
            StyleLayer to produce professional product images in seconds.
          </p>
          <Link
            href={user ? "/generate" : "/sign-in"}
            className="mt-8 inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-stone-900 shadow-sm transition-all hover:bg-stone-100"
          >
            {user ? "Go to Generator" : "Start Free Today"}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Image
              src="/logo.jpeg"
              alt="StyleLayer AI"
              width={814}
              height={138}
              className="h-6 w-auto"
            />
            <nav className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
          <div className="mt-6 border-t border-stone-200/60 pt-6 text-center">
            <p className="text-sm text-stone-400">
              &copy; {new Date().getFullYear()} StyleLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
