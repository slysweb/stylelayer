import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | StyleLayer AI",
  description: "Read the terms and conditions governing your use of StyleLayer AI services.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-stone-400">
          Last updated: February 2026
        </p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-stone-900">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using StyleLayer AI (&quot;the Service&quot;), available at
              stylelayer.app, you agree to be bound by these Terms of Service. If you do not
              agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">2. Description of Service</h2>
            <p className="mt-3">
              StyleLayer AI is an AI-powered image processing tool that extracts clothing,
              accessories, furniture, and other items from photographs to create professional
              flat lay and product images. The Service is provided on a credit-based system.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">3. Account Registration</h2>
            <p className="mt-3">
              To use the Service, you must sign in using a valid Google account. You are
              responsible for maintaining the security of your account credentials. You agree
              to provide accurate and complete information and to notify us immediately of any
              unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">4. Credits & Payment</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>New accounts receive 3 free credits upon registration.</li>
              <li>Each image generation consumes 1 credit.</li>
              <li>Additional credits may be purchased through the platform.</li>
              <li>Credits are non-refundable and non-transferable.</li>
              <li>We reserve the right to modify pricing and credit allocation at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">5. User Content</h2>
            <p className="mt-3">You retain ownership of all images you upload. By uploading content, you:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Grant us a limited, non-exclusive license to process the image for the purpose of providing the Service.</li>
              <li>Represent that you have the right to upload and process the content.</li>
              <li>Agree not to upload illegal, harmful, or infringing content.</li>
            </ul>
            <p className="mt-3">
              Generated output images are yours to use for any purpose, including commercial
              use. We claim no ownership over generated results.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">6. Acceptable Use</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Upload content that infringes on intellectual property rights of others.</li>
              <li>Attempt to reverse-engineer, decompile, or hack the Service.</li>
              <li>Use automated tools or bots to access the Service excessively.</li>
              <li>Upload content depicting minors, violence, or explicit material.</li>
              <li>Resell or redistribute the Service itself without authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">7. Intellectual Property</h2>
            <p className="mt-3">
              The Service, including its design, code, AI models, branding, and documentation,
              is the intellectual property of StyleLayer AI. You may not copy, modify, or
              distribute any part of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">8. Service Availability</h2>
            <p className="mt-3">
              We strive to maintain high availability, but the Service is provided &quot;as is&quot;
              without guarantees of uptime. We may perform maintenance, updates, or
              modifications that temporarily affect availability. We are not liable for any
              losses resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">9. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, StyleLayer AI shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from
              your use of the Service. Our total liability shall not exceed the amount you paid
              for the Service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">10. Termination</h2>
            <p className="mt-3">
              We reserve the right to suspend or terminate your account at our sole discretion
              if you violate these terms. Upon termination, your right to use the Service
              ceases immediately. Any unused credits will be forfeited upon termination for
              cause.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">11. Changes to Terms</h2>
            <p className="mt-3">
              We may revise these Terms of Service at any time. Material changes will be
              communicated via the website or email. Your continued use of the Service after
              changes take effect constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">12. Governing Law</h2>
            <p className="mt-3">
              These terms shall be governed by and construed in accordance with applicable laws.
              Any disputes arising from these terms or the Service shall be resolved through
              good-faith negotiation or, if necessary, binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">13. Contact</h2>
            <p className="mt-3">
              For questions about these Terms of Service, please contact us at{" "}
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
