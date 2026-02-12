"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { OAuthButtons } from "@/components/oauth-buttons";

export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/generate");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf9] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
            StyleLayer AI
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Sign in to generate layouts
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <OAuthButtons />
          <p className="mt-6 text-center text-xs text-stone-400">
            By signing in, you agree to our terms of service.
          </p>
        </div>

        <p className="text-center text-sm text-stone-500">
          <Link href="/" className="underline hover:text-stone-900">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
