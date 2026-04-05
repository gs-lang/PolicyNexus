"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getMyAssignments, getAcknowledgment } from "@/lib/assignments";
import { getPolicy } from "@/lib/policies";
import type { Policy } from "@/types/policy";
import type { Assignment, Acknowledgment } from "@/types/assignment";

interface AssignedPolicy {
  assignment: Assignment;
  policy: Policy;
  acknowledgment: Acknowledgment | null;
}

export default function MyPoliciesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AssignedPolicy[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/my-policies");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getMyAssignments(user.uid).then(async (assignments) => {
      const results = await Promise.all(
        assignments.map(async (a) => {
          const [policy, acknowledgment] = await Promise.all([
            getPolicy(a.policyId),
            getAcknowledgment(a.policyId, user.uid),
          ]);
          return policy && !policy.deletedAt
            ? ({ assignment: a, policy, acknowledgment } as AssignedPolicy)
            : null;
        })
      );
      setItems(results.filter((r): r is AssignedPolicy => r !== null));
      setFetching(false);
    });
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Policies</h1>

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">No policies assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {items.map(({ policy, acknowledgment, assignment }) => (
            <div key={policy.id} className="px-4 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/policies/${policy.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                >
                  {policy.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{policy.category}</span>
                  <span>·</span>
                  <span>v{policy.version}</span>
                  {assignment.dueDate && (
                    <>
                      <span>·</span>
                      <span>Due {assignment.dueDate.toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {acknowledgment ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    ✓ Acknowledged
                  </span>
                ) : (
                  <Link
                    href={`/policies/${policy.id}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium hover:bg-yellow-200"
                  >
                    Pending acknowledgment
                  </Link>
                )}
                {acknowledgment && (
                  <span className="text-xs text-gray-400">
                    {acknowledgment.acknowledgedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
