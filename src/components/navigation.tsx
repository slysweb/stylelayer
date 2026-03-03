"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

function MobileMenu({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm transition-opacity duration-200 sm:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <nav
        className={`fixed right-0 top-0 z-[9999] flex h-full w-64 flex-col gap-5 bg-white px-6 pt-20 shadow-xl transition-transform duration-200 ease-in-out sm:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </nav>
    </>,
    document.body
  );
}

export function Navigation() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchCredits = useCallback(() => {
    fetch("/api/user/credits")
      .then((res) => res.json())
      .then((data) => setCredits(data.credits ?? 0))
      .catch(() => setCredits(null));
  }, []);

  useEffect(() => {
    if (user) fetchCredits();
  }, [user, fetchCredits]);

  useEffect(() => {
    const handler = () => fetchCredits();
    window.addEventListener("credits-updated", handler);
    return () => window.removeEventListener("credits-updated", handler);
  }, [fetchCredits]);

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
    );
  }

  const avatar = (size: "sm" | "md" = "sm") => {
    const cls = size === "sm" ? "h-8 w-8" : "h-10 w-10";
    const textCls = size === "sm" ? "text-xs" : "text-sm";
    return user?.picture ? (
      <Image
        src={user.picture}
        alt={user.name}
        width={40}
        height={40}
        className={`${cls} rounded-full`}
      />
    ) : (
      <span
        className={`flex ${cls} items-center justify-center rounded-full bg-stone-200 ${textCls} font-medium text-stone-600`}
      >
        {user?.name?.[0] ?? user?.email?.[0] ?? "?"}
      </span>
    );
  };

  const signOutHandler = async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  return (
    <>
      {/* ===== Desktop nav ===== */}
      <nav className="hidden items-center gap-2 sm:flex">
        {user ? (
          <>
            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
            >
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
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              Generate
            </Link>

            <Link
              href="/dashboard"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              Dashboard
            </Link>
            <Link
              href="/blog"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              Blog
            </Link>

            <div className="ml-1 h-5 w-px bg-stone-200" />

            {credits !== null && (
              <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                {credits} credits
              </span>
            )}

            <button
              onClick={signOutHandler}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-stone-400 transition-colors hover:text-stone-700"
            >
              Sign out
            </button>

            {avatar("sm")}
          </>
        ) : (
          <>
          <Link
            href="/blog"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Blog
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50"
          >
            Sign in
          </Link>
          </>
        )}
      </nav>

      {/* ===== Mobile hamburger button ===== */}
      <button
        className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 sm:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* ===== Mobile menu ===== */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
        {user ? (
          <>
            {/* User info */}
            <div className="flex items-center gap-3 border-b border-stone-100 pb-5">
              {avatar("md")}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-stone-400">{user.email}</p>
              </div>
            </div>

            {credits !== null && (
              <span className="self-start rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                {credits} credits
              </span>
            )}

            {/* Generate CTA */}
            <Link
              href="/generate"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800"
              onClick={() => setMenuOpen(false)}
            >
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
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              Generate
            </Link>

            <Link
              href="/dashboard"
              className="py-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/blog"
              className="py-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>

            <div className="mt-auto border-t border-stone-100 pb-8 pt-4">
              <button
                onClick={signOutHandler}
                className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-700"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/blog"
              className="py-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>
          </>
        )}
      </MobileMenu>
    </>
  );
}
