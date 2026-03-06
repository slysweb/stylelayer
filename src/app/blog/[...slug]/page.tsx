import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { allPosts } from "@/lib/velite";
import { Navigation } from "@/components/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/lib/mdx-components";
import { TableOfContentsWrapper } from "@/components/table-of-contents-wrapper";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  return allPosts
    .filter((post) => post.published)
    .map((post) => ({
      slug: post.slugAsParams.split('/'),
    }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug.join('/');
  const post = allPosts.find((p) => p.slugAsParams === slugString);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | StyleLayer Blog`,
    description: post.description || post.title,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const slugString = slug.join('/');
  const post = allPosts.find((p) => p.slugAsParams === slugString);

  if (!post || !post.published) {
    notFound();
  }

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

      {/* Blog Post Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-4xl">
            {/* Back link */}
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Blog
            </Link>

            {/* Post Header */}
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-3 text-sm text-stone-500">
                <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
                  {post.category}
                </span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-4 text-xl text-stone-500">{post.description}</p>
              )}
            </header>

            {/* Cover Image */}
            {post.image && (
              <div className="relative mb-12 aspect-video overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Post Body with MDXContent */}
            <div className="prose prose-neutral dark:prose-invert lg:prose-xl max-w-none">
              <MDXContent code={post.body} />
            </div>

            {/* Footer */}
            <div className="mt-12 border-t border-stone-200 pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Back to Blog
              </Link>
            </div>
          </article>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContentsWrapper />
          </aside>
        </div>
      </div>

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
