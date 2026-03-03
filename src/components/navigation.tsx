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
      <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
    );
  }

  const navLinks = (mobile: boolean) => (
    <>
      <Link
        href="/blog"
        className={`text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 ${mobile ? "py-1" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        Blog
      </Link>
      {user ? (
        <>
          {credits !== null && (
            <span className="self-start rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600">
              {credits} credits
            </span>
          )}
          <Link
            href="/dashboard"
            className={`text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 ${mobile ? "py-1" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/generate"
            className={`text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 ${mobile ? "py-1" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Generate
          </Link>
          <div className={`flex items-center gap-3 ${mobile ? "py-1" : ""}`}>
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
            {mobile && (
              <span className="text-sm text-stone-500">{user.name || user.email}</span>
            )}
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
              window.location.href = "/";
            }}
            className={`text-left text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 ${mobile ? "py-1" : ""}`}
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/sign-in"
          className={`rounded-md border border-stone-300 bg-white px-4 py-2 text-center text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 ${mobile ? "self-start" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          Sign in
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-4 sm:flex">
        {navLinks(false)}
      </nav>

      {/* Mobile hamburger button */}
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

      {/* Mobile menu - rendered via portal to escape header's backdrop-filter containing block */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
        {navLinks(true)}
      </MobileMenu>
    </>
  );
}
