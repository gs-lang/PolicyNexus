export interface Assignment {
  id: string;
  policyId: string;
  assignedTo: string[]; // uid[]
  assignedBy: string;
  dueDate?: Date | null;
  createdAt: Date;
}

export interface Acknowledgment {
  id: string; // policyId_uid
  policyId: string;
  userId: string;
  acknowledgedAt: Date;
  policyVersion: number;
}

export interface OrgUser {
  uid: string;
  email: string;
  displayName?: string | null;
}
