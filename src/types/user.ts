export type UserPlan = "trial" | "starter" | "growth" | "business" | "inactive";

export interface UserProfile {
  uid: string;
  email: string;
  plan: UserPlan;
  trialEndsAt: Date | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export function isActivePlan(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.plan === "trial") {
    return profile.trialEndsAt ? profile.trialEndsAt > new Date() : false;
  }
  return ["starter", "growth", "business"].includes(profile.plan);
}
