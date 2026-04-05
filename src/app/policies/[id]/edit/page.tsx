"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getPolicy, updatePolicy } from "@/lib/policies";
import PolicyForm from "@/components/PolicyForm";
import type { Policy, PolicyCategory, PolicyStatus } from "@/types/policy";

export default function EditPolicyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push(`/login?next=/policies/${id}/edit`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user) return;
    getPolicy(id).then((p) => {
      setPolicy(p);
      setFetching(false);
    });
  }, [user, id]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  if (!policy || policy.deletedAt) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/policies" className="text-sm text-indigo-600 hover:underline">
          ← Back to policies
        </Link>
        <p className="mt-4 text-gray-500">Policy not found.</p>
      </div>
    );
  }

  async function handleSubmit(values: {
    title: string;
    body: string;
    category: PolicyCategory;
    status: PolicyStatus;
  }) {
    await updatePolicy(id, values, policy!.version);
    router.push(`/policies/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/policies/${id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to policy
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Edit Policy{" "}
          <span className="text-gray-400 font-normal text-lg">v{policy.version} → v{policy.version + 1}</span>
        </h1>
      </div>
      <PolicyForm
        initialValues={{
          title: policy.title,
          body: policy.body,
          category: policy.category,
          status: policy.status,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
