import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-secondary mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-secondary/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-primary">Payment Cancelled</h1>
            <p className="text-lg text-gray-700 mb-6">Your payment was cancelled. No charges were made.</p>

            <div className="space-y-4">
              <Link
                href="/cart"
                className="inline-block bg-accent text-primary px-8 py-4 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-primary/20"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
