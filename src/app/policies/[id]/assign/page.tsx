"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getPolicy } from "@/lib/policies";
import { getAssignment, setAssignment, listOrgUsers } from "@/lib/assignments";
import type { Policy } from "@/types/policy";
import type { OrgUser } from "@/types/assignment";

export default function AssignPolicyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push(`/login?next=/policies/${id}/assign`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getPolicy(id), getAssignment(id), listOrgUsers()]).then(
      ([p, assignment, users]) => {
        setPolicy(p);
        setOrgUsers(users);
        if (assignment) {
          setSelectedUids(new Set(assignment.assignedTo));
        }
        setFetching(false);
      }
    );
  }, [user, id]);

  function toggleUser(uid: string) {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await setAssignment(id, Array.from(selectedUids), user.uid);
    setSaving(false);
    setSaved(true);
  }

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
      <div className="mb-6">
        <Link
          href={`/policies/${id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to policy
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Assign policy</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-700">{policy.title}</span> · v
          {policy.version}
        </p>
      </div>

      {orgUsers.length === 0 ? (
        <p className="text-gray-500 text-sm">No other users in the org yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {orgUsers.map((u) => (
            <label
              key={u.uid}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedUids.has(u.uid)}
                onChange={() => toggleUser(u.uid)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-800">
                {u.displayName || u.email}
              </span>
              {u.displayName && (
                <span className="text-xs text-gray-400">{u.email}</span>
              )}
              {u.uid === user.uid && (
                <span className="text-xs text-indigo-500 ml-auto">You</span>
              )}
            </label>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save assignments"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Assignments saved.</span>
        )}
      </div>

      {selectedUids.size > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          {selectedUids.size} user{selectedUids.size !== 1 ? "s" : ""} assigned.
          They&apos;ll see this policy in their My Policies page.
        </p>
      )}
    </div>
  );
}
