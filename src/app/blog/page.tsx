import Link from "next/link";
import Image from "next/image";
import { posts, getReadingTime } from "@/lib/velite";
import { Navigation } from "@/components/navigation";

export default function BlogPage() {
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

      {/* Blog Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-stone-500">
            Latest updates, tips, and insights from StyleLayer
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
            <p className="text-stone-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const readingTime = getReadingTime(
                typeof post.body === 'string' 
                  ? post.body 
                  : JSON.stringify(post.body)
              );

              return (
                <article
                  key={post.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <Link href={`/blog/${post.slugAsParams}`} className="flex flex-col flex-1">
                    {/* Cover Image */}
                    {post.image && (
                      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      {/* Category and Date */}
                      <div className="mb-3 flex items-center gap-3 text-xs text-stone-500">
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
                          {post.category}
                        </span>
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>

                      {/* Title */}
                      <h2 className="mb-2 text-xl font-semibold leading-tight text-stone-900 transition-colors group-hover:text-stone-600">
                        {post.title}
                      </h2>

                      {/* Description */}
                      {post.description && (
                        <p className="mb-4 flex-1 text-sm leading-relaxed text-stone-500 line-clamp-2">
                          {post.description}
                        </p>
                      )}

                      {/* Reading Time */}
                      <div className="mt-auto flex items-center gap-2 text-xs text-stone-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{readingTime} min read</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Image
              src="/logo.jpeg"
              alt="StyleLayer AI"
              width={814}
              height={138}
              className="h-6 w-auto"
            />
            <nav className="flex flex-wrap items-center gap-6">
              <Link
                href="/about"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-stone-400 transition-colors hover:text-stone-600"
              >
                Pricing
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
