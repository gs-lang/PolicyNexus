import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment cancelled</h1>
      <p className="text-gray-600 mb-8">
        No worries — you can upgrade whenever you&rsquo;re ready. Your free trial continues
        until it expires.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/pricing"
          className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 text-sm"
        >
          View pricing
        </Link>
        <Link
          href="/dashboard"
          className="inline-block bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-md font-medium hover:bg-gray-50 text-sm"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
