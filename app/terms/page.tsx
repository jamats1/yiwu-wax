import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Yiwu Wax terms of service — the rules and conditions that apply when you shop with us.",
  alternates: { canonical: `${getSiteUrl()}/terms` },
  openGraph: {
    title: "Terms of Service | Yiwu Wax",
    description: "The terms and conditions that apply when you shop at Yiwu Wax.",
    url: `${getSiteUrl()}/terms`,
    siteName: "Yiwu Wax",
    type: "website",
  },
};

const LAST_UPDATED = "May 2025";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mb-10 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-gray-700">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Acceptance of terms</h2>
            <p>
              By accessing or purchasing from Yiwu Wax (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Products</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>All products are sold by the yard unless otherwise stated.</li>
              <li>Colours may vary slightly from screen representations due to monitor settings and fabric dye lots.</li>
              <li>We reserve the right to discontinue any product at any time.</li>
              <li>Product images are for illustrative purposes; minor pattern variations are normal in wax print fabrics.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. Pricing & payment</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>All prices are displayed in the currency shown at checkout and are inclusive of applicable taxes unless stated.</li>
              <li>We reserve the right to update prices without prior notice.</li>
              <li>Payment is processed securely by Stripe. We do not store payment card details.</li>
              <li>Your order is confirmed only upon successful payment authorisation.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Orders & cancellations</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Once an order is placed, it enters processing immediately. Cancellations may not be possible after dispatch.</li>
              <li>We reserve the right to cancel orders due to stock discrepancies or suspected fraud, and will provide a full refund.</li>
              <li>Custom-cut fabric lengths cannot be cancelled once cutting has begun.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Shipping</h2>
            <p>
              Shipping terms are governed by our{" "}
              <a href="/shipping" className="text-primary underline underline-offset-2">Shipping Policy</a>.
              Delivery times are estimates and not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Returns & refunds</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Faulty or incorrect items may be returned within 7 days of receipt. Contact us to arrange a return.</li>
              <li>Custom-cut fabric lengths are non-returnable unless faulty.</li>
              <li>Fabrics that have been washed, cut, or altered are not eligible for return.</li>
              <li>Refunds are issued to the original payment method within 5–10 business days of receiving the returned item.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Intellectual property</h2>
            <p>
              All content on this site — including images, text, and branding — is owned by or licensed to Yiwu Wax.
              You may not reproduce, distribute, or use our content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Yiwu Wax is not liable for any indirect, incidental, or consequential
              damages arising from your use of our site or products. Our total liability shall not exceed the value of your order.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">9. Governing law</h2>
            <p>
              These terms are governed by applicable law. Any disputes shall be resolved through good-faith negotiation.
              If unresolved, disputes shall be subject to the jurisdiction of the relevant courts.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">10. Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:hello@yiwuwax.com" className="text-primary underline underline-offset-2">hello@yiwuwax.com</a>{" "}
              or via our{" "}
              <a href="/contact" className="text-primary underline underline-offset-2">contact page</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
