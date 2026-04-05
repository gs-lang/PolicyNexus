import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
  [process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? ""]: "growth",
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ?? ""]: "business",
};

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  initFirebaseAdmin();
  const db = getFirestore();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.firebaseUid;
    if (!uid) {
      return NextResponse.json({ error: "Missing firebaseUid metadata" }, { status: 400 });
    }

    // Get the subscription to find the price ID
    let plan = "starter";
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id ?? "";
      plan = PRICE_TO_PLAN[priceId] ?? "starter";
    }

    await db.collection("users").doc(uid).update({
      plan,
      stripeSubscriptionId: session.subscription ?? null,
      updatedAt: new Date(),
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    // Find user by stripeCustomerId
    const snap = await db
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (!snap.empty) {
      await snap.docs[0].ref.update({
        plan: "inactive",
        stripeSubscriptionId: null,
        updatedAt: new Date(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
