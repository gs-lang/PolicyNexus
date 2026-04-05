import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            PolicyNexus
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
