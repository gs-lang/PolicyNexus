"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        if (!snap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email,
            plan: "trial",
            trialEndsAt: Timestamp.fromDate(trialEndsAt),
            createdAt: serverTimestamp(),
          });
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            plan: "trial",
            trialEndsAt,
          });
        } else {
          const data = snap.data();
          setProfile({
            uid: firebaseUser.uid,
            email: data.email ?? firebaseUser.email ?? "",
            plan: data.plan ?? "trial",
            trialEndsAt: data.trialEndsAt ? (data.trialEndsAt as Timestamp).toDate() : null,
            stripeCustomerId: data.stripeCustomerId,
            stripeSubscriptionId: data.stripeSubscriptionId,
          });
        }
        // Set presence cookie for middleware
        document.cookie = "policynexus_auth=1; path=/; max-age=3600; SameSite=Lax";
      } else {
        setProfile(null);
        document.cookie = "policynexus_auth=; path=/; max-age=0";
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
