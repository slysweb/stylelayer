"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export function Navigation() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchCredits = () => {
    fetch("/api/user/credits")
      .then((res) => res.json())
      .then((data) => setCredits(data.credits ?? 0))
      .catch(() => setCredits(null));
  };

  useEffect(() => {
    if (user) fetchCredits();
  }, [user]);

  useEffect(() => {
    const handler = () => fetchCredits();
    window.addEventListener("credits-updated", handler);
    return () => window.removeEventListener("credits-updated", handler);
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
    );
  }

  return (
    <nav className="flex items-center gap-4">
      {user ? (
        <>
          {credits !== null && (
            <span className="rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600">
              {credits} credits
            </span>
          )}
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
          {user.picture ? (
            <Image
              src={user.picture}
              alt={user.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-600">
              {user.name?.[0] ?? user.email?.[0] ?? "?"}
            </span>
          )}
          <Link
            href="/api/auth/signout"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Sign out
          </Link>
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
