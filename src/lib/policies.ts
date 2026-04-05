import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Policy, PolicyCategory, PolicyStatus } from "@/types/policy";

const COL = "policies";

function toPolicy(id: string, data: Record<string, unknown>): Policy {
  return {
    id,
    title: data.title as string,
    body: (data.body as string) ?? "",
    category: data.category as PolicyCategory,
    version: (data.version as number) ?? 1,
    createdBy: (data.createdBy as string) ?? "",
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    status: data.status as PolicyStatus,
    deletedAt: data.deletedAt ? (data.deletedAt as Timestamp).toDate() : null,
  };
}

export async function listPolicies(): Promise<Policy[]> {
  const q = query(collection(db, COL), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toPolicy(d.id, d.data()))
    .filter((p) => !p.deletedAt);
}

export async function getPolicy(id: string): Promise<Policy | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toPolicy(snap.id, snap.data() as Record<string, unknown>);
}

export async function createPolicy(
  data: { title: string; body: string; category: PolicyCategory; status: PolicyStatus },
  uid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    version: 1,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });
  return ref.id;
}

export async function updatePolicy(
  id: string,
  data: { title: string; body: string; category: PolicyCategory; status: PolicyStatus },
  currentVersion: number
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    version: currentVersion + 1,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePolicy(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    deletedAt: serverTimestamp(),
  });
}
