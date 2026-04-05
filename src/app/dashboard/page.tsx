"use client";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isActivePlan } from "@/types/user";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface DashboardStats {
  totalPolicies: number;
  acknowledgmentRate: number;
  overdueReviews: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  label: string;
  time: Date;
}

async function loadStats(): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Total published policies (exclude soft-deleted)
  const policiesSnap = await getDocs(
    query(
      collection(db, "policies"),
      where("status", "==", "published"),
      where("deletedAt", "==", null)
    )
  );
  const totalPolicies = policiesSnap.size;

  // Assignments: count total assignees
  const assignmentsSnap = await getDocs(collection(db, "assignments"));
  let totalAssignees = 0;
  assignmentsSnap.forEach((d) => {
    const data = d.data();
    totalAssignees += ((data.assignedTo as string[]) ?? []).length;
  });

  // Acknowledgments
  const ackSnap = await getDocs(collection(db, "acknowledgments"));
  const totalAcks = ackSnap.size;
  const acknowledgmentRate =
    totalAssignees > 0 ? Math.round((totalAcks / totalAssignees) * 100) : 0;

  // Overdue: assignments older than 30 days with unacknowledged users
  const ackedSet = new Set<string>();
  ackSnap.forEach((d) => ackedSet.add(d.id)); // id = policyId_uid

  let overdueReviews = 0;
  assignmentsSnap.forEach((d) => {
    const data = d.data();
    const policyId = d.id;
    const assignedTo = (data.assignedTo as string[]) ?? [];
    const createdAt = data.createdAt?.toDate() as Date | undefined;
    if (createdAt && createdAt < thirtyDaysAgo) {
      for (const uid of assignedTo) {
        if (!ackedSet.has(`${policyId}_${uid}`)) overdueReviews++;
      }
    }
  });

  // Recent activity: last 5 policy edits
  const recentSnap = await getDocs(
    query(collection(db, "policies"), orderBy("updatedAt", "desc"), limit(5))
  );
  const recentActivity: ActivityItem[] = recentSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      label: `Policy updated: ${data.title as string}`,
      time: (data.updatedAt?.toDate() as Date) ?? new Date(),
    };
  });

  return { totalPolicies, acknowledgmentRate, overdueReviews, recentActivity };
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const active = isActivePlan(profile);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && active) {
      loadStats()
        .then(setStats)
        .finally(() => setStatsLoading(false));
    } else if (!loading) {
      setStatsLoading(false);
    }
  }, [user, active, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!active) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your trial has ended</h1>
        <p className="text-gray-600 mb-8">
          Choose a plan to continue using PolicyNexus and access your compliance dashboard.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
        >
          View plans &amp; pricing
        </Link>
      </div>
    );
  }

  const trialDaysLeft =
    profile?.plan === "trial" && profile.trialEndsAt
      ? Math.max(0, Math.ceil((profile.trialEndsAt.getTime() - Date.now()) / 86_400_000))
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {trialDaysLeft !== null && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-md px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-indigo-800">
            You have{" "}
            <strong>
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}
            </strong>{" "}
            left in your free trial.
          </span>
          <Link href="/pricing" className="text-indigo-600 font-medium hover:underline ml-4">
            Upgrade now
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 text-sm mb-8">Welcome back, {user.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Policies"
          value={statsLoading ? "…" : String(stats?.totalPolicies ?? 0)}
        />
        <StatCard
          label="Acknowledgment Rate"
          value={statsLoading ? "…" : `${stats?.acknowledgmentRate ?? 0}%`}
        />
        <StatCard
          label="Overdue Reviews"
          value={statsLoading ? "…" : String(stats?.overdueReviews ?? 0)}
          highlight={(stats?.overdueReviews ?? 0) > 0}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {statsLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : stats?.recentActivity.length ? (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {stats.recentActivity.map((item) => (
              <li key={item.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-400 text-xs">{item.time.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">
            No activity yet.{" "}
            <Link href="/policies/new" className="text-indigo-600 hover:underline">
              Create your first policy
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${highlight ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
