"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getPolicy, deletePolicy } from "@/lib/policies";
import { getAssignment, getAcknowledgment, acknowledgePolicy } from "@/lib/assignments";
import type { Policy } from "@/types/policy";
import type { Assignment, Acknowledgment } from "@/types/assignment";

export default function PolicyDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [acknowledgment, setAcknowledgment] = useState<Acknowledgment | null>(null);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push(`/login?next=/policies/${id}`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getPolicy(id),
      getAssignment(id),
      getAcknowledgment(id, user.uid),
    ]).then(([p, a, ack]) => {
      setPolicy(p);
      setAssignment(a);
      setAcknowledgment(ack);
      setFetching(false);
    });
  }, [user, id]);

  async function handleDelete() {
    if (!confirm("Delete this policy?")) return;
    setDeleting(true);
    await deletePolicy(id);
    router.push("/policies");
  }

  async function handleAcknowledge() {
    if (!user || !policy) return;
    setAcknowledging(true);
    await acknowledgePolicy(id, user.uid, policy.version);
    const ack = await getAcknowledgment(id, user.uid);
    setAcknowledgment(ack);
    setAcknowledging(false);
  }

  const isAssigned = assignment?.assignedTo.includes(user?.uid ?? "") ?? false;

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/policies" className="text-sm text-indigo-600 hover:underline">
            ← Back to policies
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{policy.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>{policy.category}</span>
            <span>·</span>
            <span>v{policy.version}</span>
            <span>·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                policy.status === "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {policy.status}
            </span>
            <span>·</span>
            <span>Updated {policy.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-1 shrink-0">
          <Link
            href={`/policies/${id}/assign`}
            className="text-sm text-indigo-600 hover:underline"
          >
            Assign
          </Link>
          <Link
            href={`/policies/${id}/edit`}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:underline disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Acknowledgment banner for assigned users */}
      {isAssigned && (
        <div
          className={`mb-6 flex items-center justify-between px-4 py-3 rounded-lg border ${
            acknowledgment
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          {acknowledgment ? (
            <div>
              <p className="text-sm font-medium text-green-700">
                You acknowledged this policy (v{acknowledgment.policyVersion})
              </p>
              <p className="text-xs text-green-500 mt-0.5">
                {acknowledgment.acknowledgedAt.toLocaleString()}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-yellow-700">
                This policy requires your acknowledgment
              </p>
              <p className="text-xs text-yellow-500 mt-0.5">
                Please read the policy and click Acknowledge.
              </p>
            </div>
          )}
          {!acknowledgment && (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="shrink-0 ml-4 px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-40"
            >
              {acknowledging ? "Saving…" : "Acknowledge"}
            </button>
          )}
        </div>
      )}

      {/* Assignment status (admin view) */}
      {assignment && assignment.assignedTo.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <span>
            Assigned to {assignment.assignedTo.length} user
            {assignment.assignedTo.length !== 1 ? "s" : ""}
          </span>
          <Link
            href={`/policies/${id}/assign`}
            className="text-indigo-500 hover:underline"
          >
            Manage
          </Link>
        </div>
      )}

      <div
        className="prose max-w-none bg-white border border-gray-200 rounded-lg p-6"
        dangerouslySetInnerHTML={{ __html: policy.body || "<p><em>No content.</em></p>" }}
      />
    </div>
  );
}
