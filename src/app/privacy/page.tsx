import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | StyleLayer AI",
  description: "Learn how StyleLayer AI collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-stone-400">
          Last updated: February 2026
        </p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-stone-900">1. Introduction</h2>
            <p className="mt-3">
              Welcome to StyleLayer AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
              protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              data when you use our website and services at stylelayer.app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">2. Information We Collect</h2>
            <p className="mt-3">We collect the following types of information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account Information:</strong> When you sign in with Google, we receive
                your name, email address, and profile picture from your Google account.
              </li>
              <li>
                <strong>Uploaded Content:</strong> Images you upload for AI processing. These
                are stored temporarily to perform the extraction and generate results.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect information about how you interact
                with our service, including pages visited, features used, and generation history.
              </li>
              <li>
                <strong>Technical Data:</strong> Browser type, device information, IP address,
                and cookies necessary for authentication and session management.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">3. How We Use Your Information</h2>
            <p className="mt-3">We use the collected information to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide, maintain, and improve our AI image extraction services.</li>
              <li>Authenticate your identity and manage your account.</li>
              <li>Process your uploaded images and deliver generated results.</li>
              <li>Track credit usage and manage billing.</li>
              <li>Communicate important updates about our service.</li>
              <li>Detect and prevent fraud or abuse of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">4. Data Storage & Security</h2>
            <p className="mt-3">
              Your data is stored securely using Cloudflare&apos;s infrastructure, including D1
              databases and R2 storage. We implement industry-standard security measures to
              protect your personal information against unauthorized access, alteration,
              disclosure, or destruction. Uploaded images are processed on secure servers and
              are not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">5. Data Sharing</h2>
            <p className="mt-3">
              We do not sell, trade, or rent your personal information to third parties. We may
              share your data only in the following circumstances:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>With your explicit consent.</li>
              <li>To comply with legal obligations or respond to lawful requests.</li>
              <li>
                With service providers who assist in operating our platform (e.g., cloud
                hosting, payment processing), bound by confidentiality agreements.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">6. Cookies</h2>
            <p className="mt-3">
              We use essential cookies to maintain your login session and provide a seamless
              experience. We do not use third-party tracking cookies or advertising cookies.
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">7. Your Rights</h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for data processing at any time.</li>
              <li>Export your data in a portable format.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">8. Data Retention</h2>
            <p className="mt-3">
              We retain your account information for as long as your account is active. Uploaded
              images are stored for a limited period to enable re-downloads and are
              automatically purged thereafter. You may request immediate deletion of your data
              at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">9. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Our service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">10. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the updated policy on this page with a revised
              &quot;Last updated&quot; date. Your continued use of the service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">11. Contact Us</h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy or wish to exercise your
              rights, please contact us at{" "}
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
