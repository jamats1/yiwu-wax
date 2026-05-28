import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Yiwu Wax privacy policy — how we collect, use, and protect your personal data when you shop with us.",
  alternates: { canonical: `${getSiteUrl()}/privacy` },
  openGraph: {
    title: "Privacy Policy | Yiwu Wax",
    description: "How Yiwu Wax collects, uses, and protects your personal data.",
    url: `${getSiteUrl()}/privacy`,
    siteName: "Yiwu Wax",
    type: "website",
  },
};

const LAST_UPDATED = "May 2025";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Who we are</h2>
            <p>
              Yiwu Wax (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates yiwuwax.com, an online store selling African wax print fabrics.
              If you have questions about this policy, contact us at{" "}
              <a href="mailto:hello@yiwuwax.com" className="text-primary underline underline-offset-2">hello@yiwuwax.com</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Data we collect</h2>
            <p className="mb-2">When you use our site, we may collect:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Account data</strong> — name, email address, and profile information when you sign up via Clerk.</li>
              <li><strong>Order data</strong> — billing and shipping address, items purchased, and payment confirmation (we do not store card details — payments are handled by Stripe).</li>
              <li><strong>Usage data</strong> — pages visited, browser type, IP address, and referral source collected automatically.</li>
              <li><strong>Communications</strong> — messages you send us via WhatsApp or email.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. How we use your data</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>To process and fulfil your orders.</li>
              <li>To send order confirmations and shipping updates.</li>
              <li>To respond to your enquiries.</li>
              <li>To improve our website and product offering.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Third-party services</h2>
            <p className="mb-2">We use the following third-party services, each subject to their own privacy policy:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Clerk</strong> — user authentication and account management.</li>
              <li><strong>Stripe</strong> — secure payment processing. We never see or store your card number.</li>
              <li><strong>Sanity</strong> — content management for product data.</li>
              <li><strong>WhatsApp</strong> — customer support communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Data retention</h2>
            <p>
              We retain order and account data for as long as necessary to provide our services and comply with legal obligations.
              You may request deletion of your account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Your rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@yiwuwax.com" className="text-primary underline underline-offset-2">hello@yiwuwax.com</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and cart functionality. No advertising or tracking cookies are set by us.
              Third-party services (Clerk, Stripe) may set their own cookies as described in their policies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with an updated date.
              Continued use of the site after changes constitutes acceptance.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
