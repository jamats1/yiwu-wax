import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p>Your payment was cancelled. No charges were made.</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/cart"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
