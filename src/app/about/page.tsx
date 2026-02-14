import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | StyleLayer AI",
  description: "Learn about StyleLayer AI — the AI-powered flat lay and product extraction tool for creators and sellers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
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
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          About StyleLayer AI
        </h1>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-stone-900">Our Mission</h2>
            <p className="mt-3">
              StyleLayer AI was built with a simple goal: make professional product photography
              accessible to everyone. Whether you&apos;re a fashion creator sharing your daily
              outfits, an Etsy seller showcasing handmade accessories, or an interior designer
              curating mood boards — we believe you shouldn&apos;t need a studio to create stunning
              product images.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">What We Do</h2>
            <p className="mt-3">
              Our AI-powered platform extracts individual items from any photograph and
              transforms them into clean, studio-quality flat lay images. Upload a casual selfie,
              a room shot, or a product photo, and our technology will identify and isolate each
              item — clothing, shoes, bags, jewelry, furniture, and more — delivering polished
              results in seconds.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Who We Serve</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-stone-900">Content Creators</h3>
                <p className="mt-2">
                  Turn everyday outfit photos into Instagram-worthy OOTD flat lays that engage
                  your audience and grow your following.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-stone-900">E-commerce Sellers</h3>
                <p className="mt-2">
                  Create clean, consistent product images for Etsy, Shopify, Amazon, and other
                  marketplaces without expensive photo shoots.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-stone-900">Fashion Stylists</h3>
                <p className="mt-2">
                  Build professional mood boards and client presentations by deconstructing
                  outfit references into organized flat lay layouts.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-stone-900">Interior Designers</h3>
                <p className="mt-2">
                  Extract furniture and decor pieces from inspiration photos to create clean
                  visual catalogs for client proposals.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Our Technology</h2>
            <p className="mt-3">
              StyleLayer is powered by advanced AI models specifically trained for item
              recognition and extraction. We leverage cutting-edge computer vision to detect
              object boundaries, remove backgrounds, and arrange items into aesthetically
              pleasing compositions. Our infrastructure runs on Cloudflare&apos;s global edge
              network, ensuring fast processing times no matter where you are.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Our Values</h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                  1
                </span>
                <div>
                  <strong className="text-stone-900">Simplicity First</strong>
                  <p className="mt-1">
                    One upload, one click, beautiful results. No learning curve, no complex
                    editing tools.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                  2
                </span>
                <div>
                  <strong className="text-stone-900">Quality Without Compromise</strong>
                  <p className="mt-1">
                    Every generated image meets professional standards — suitable for commercial
                    use, social media, and print.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                  3
                </span>
                <div>
                  <strong className="text-stone-900">Privacy & Trust</strong>
                  <p className="mt-1">
                    Your images are yours. We process them securely and never share your content
                    with third parties.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Get in Touch</h2>
            <p className="mt-3">
              We&apos;d love to hear from you. Whether you have feedback, feature requests, or
              partnership inquiries, reach out to us at{" "}
              <a
                href="mailto:support@stylelayer.app"
                className="text-stone-900 underline underline-offset-2 hover:text-stone-600"
              >
                support@stylelayer.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-stone-200/80">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-stone-400">
            &copy; {new Date().getFullYear()} StyleLayer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
