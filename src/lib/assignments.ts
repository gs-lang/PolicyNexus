import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Assignment, Acknowledgment, OrgUser } from "@/types/assignment";

// ── Assignments ───────────────────────────────────────────────────────────────

function toAssignment(id: string, data: Record<string, unknown>): Assignment {
  return {
    id,
    policyId: data.policyId as string,
    assignedTo: (data.assignedTo as string[]) ?? [],
    assignedBy: data.assignedBy as string,
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : null,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

/** Get the single assignment record for a policy (one per policy). */
export async function getAssignment(policyId: string): Promise<Assignment | null> {
  const snap = await getDoc(doc(db, "assignments", policyId));
  if (!snap.exists()) return null;
  return toAssignment(snap.id, snap.data() as Record<string, unknown>);
}

/** Create or overwrite the assignment for a policy. */
export async function setAssignment(
  policyId: string,
  assignedTo: string[],
  assignedBy: string,
  dueDate?: Date | null
): Promise<void> {
  await setDoc(doc(db, "assignments", policyId), {
    policyId,
    assignedTo,
    assignedBy,
    dueDate: dueDate ?? null,
    createdAt: serverTimestamp(),
  });
}

/** Get all policies assigned to a specific user. */
export async function getMyAssignments(uid: string): Promise<Assignment[]> {
  const q = query(
    collection(db, "assignments"),
    where("assignedTo", "array-contains", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAssignment(d.id, d.data() as Record<string, unknown>));
}

// ── Acknowledgments ───────────────────────────────────────────────────────────

function toAcknowledgment(id: string, data: Record<string, unknown>): Acknowledgment {
  return {
    id,
    policyId: data.policyId as string,
    userId: data.userId as string,
    acknowledgedAt: (data.acknowledgedAt as Timestamp)?.toDate() ?? new Date(),
    policyVersion: (data.policyVersion as number) ?? 1,
  };
}

/** Write (or overwrite) acknowledgment for a user+policy. */
export async function acknowledgePolicy(
  policyId: string,
  uid: string,
  policyVersion: number
): Promise<void> {
  const ackId = `${policyId}_${uid}`;
  await setDoc(doc(db, "acknowledgments", ackId), {
    policyId,
    userId: uid,
    acknowledgedAt: serverTimestamp(),
    policyVersion,
  });
}

/** Get a single user's acknowledgment for a policy. */
export async function getAcknowledgment(
  policyId: string,
  uid: string
): Promise<Acknowledgment | null> {
  const ackId = `${policyId}_${uid}`;
  const snap = await getDoc(doc(db, "acknowledgments", ackId));
  if (!snap.exists()) return null;
  return toAcknowledgment(snap.id, snap.data() as Record<string, unknown>);
}

/** Get all acknowledgments for a policy. */
export async function getAcknowledgments(policyId: string): Promise<Acknowledgment[]> {
  const q = query(
    collection(db, "acknowledgments"),
    where("policyId", "==", policyId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAcknowledgment(d.id, d.data() as Record<string, unknown>));
}

// ── Org users ─────────────────────────────────────────────────────────────────

/** List all users registered in the org. */
export async function listOrgUsers(): Promise<OrgUser[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({
    uid: d.id,
    email: (d.data().email as string) ?? "",
    displayName: (d.data().displayName as string | null) ?? null,
  }));
}
