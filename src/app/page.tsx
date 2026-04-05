import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Policy management that{" "}
            <span className="text-indigo-600">actually works</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Create, assign, and track policy acknowledgments across your
            organization. Know exactly who has read what — and who hasn&apos;t.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50"
            >
              See pricing
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            14-day free trial · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything your team needs to stay compliant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Policy Library",
                description:
                  "Create and manage policies with version control. Rich text editor for clear, structured documentation.",
                icon: "📋",
              },
              {
                title: "Acknowledgment Tracking",
                description:
                  "Assign policies to individuals or teams. Track read confirmations and send automated reminders.",
                icon: "✅",
              },
              {
                title: "Compliance Dashboard",
                description:
                  "Real-time overview of acknowledgment rates, overdue reviews, and compliance health across your org.",
                icon: "📊",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-indigo-600 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-indigo-200 mb-8 text-lg">
          From $29/mo for growing teams. Scale as you grow.
        </p>
        <Link
          href="/pricing"
          className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 inline-block"
        >
          View pricing plans
        </Link>
      </section>
    </div>
  );
}
