"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export function Navigation() {
  const { isSignedIn } = useUser();

  return (
    <nav className="flex items-center gap-4">
      {isSignedIn ? (
        <>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Dashboard
          </Link>
          <Link
            href="/generate"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Generate
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-0",
              },
            }}
          />
        </>
      ) : (
        <Link
          href="/sign-in"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
