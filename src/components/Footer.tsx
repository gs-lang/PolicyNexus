export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-semibold text-indigo-600">PolicyNexus</p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PolicyNexus. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            <a href="/terms" className="hover:text-gray-700">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
