export type PolicyCategory = "HR" | "Legal" | "Security" | "Compliance" | "Other";
export type PolicyStatus = "draft" | "published";

export interface Policy {
  id: string;
  title: string;
  body: string;
  category: PolicyCategory;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: PolicyStatus;
  deletedAt?: Date | null;
}
