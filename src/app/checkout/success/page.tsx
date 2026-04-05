import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">You&rsquo;re all set!</h1>
      <p className="text-gray-600 mb-8">
        Your subscription is active. Welcome to PolicyNexus — let&rsquo;s keep your team
        compliant.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
