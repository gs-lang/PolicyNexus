"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { createPolicy } from "@/lib/policies";
import PolicyForm from "@/components/PolicyForm";
import type { PolicyCategory, PolicyStatus } from "@/types/policy";

export default function NewPolicyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/policies/new");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  async function handleSubmit(values: {
    title: string;
    body: string;
    category: PolicyCategory;
    status: PolicyStatus;
  }) {
    const id = await createPolicy(values, user!.uid);
    router.push(`/policies/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/policies" className="text-sm text-indigo-600 hover:underline">
          ← Back to policies
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Policy</h1>
      </div>
      <PolicyForm onSubmit={handleSubmit} submitLabel="Create Policy" />
    </div>
  );
}
