import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// ── Email transport ───────────────────────────────────────────────────────────
// Configure via Firebase environment config:
//   firebase functions:config:set mail.host="smtp.example.com" mail.port="587" \
//     mail.user="noreply@example.com" mail.pass="secret" mail.from="PolicyNexus <noreply@example.com>"

function createTransport() {
  const cfg = functions.config().mail ?? {};
  return nodemailer.createTransport({
    host: cfg.host ?? "smtp.gmail.com",
    port: parseInt(cfg.port ?? "587"),
    secure: false,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
}

const FROM_ADDRESS =
  (functions.config().mail ?? {}).from ?? "PolicyNexus <noreply@policynexus.app>";

// ── Scheduled reminder function ───────────────────────────────────────────────
/**
 * Runs daily at 08:00 UTC.
 * For every assignment, finds users who have NOT acknowledged the policy
 * and whose assignment is more than 7 days old — and emails them a reminder.
 */
export const sendAcknowledgmentReminders = functions.pubsub
  .schedule("0 8 * * *")
  .timeZone("UTC")
  .onRun(async () => {
    const transport = createTransport();
    const now = admin.firestore.Timestamp.now();
    const sevenDaysAgo = new Date(now.toMillis() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all assignments older than 7 days
    const assignmentsSnap = await db
      .collection("assignments")
      .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .get();

    functions.logger.info(
      `Processing ${assignmentsSnap.size} assignments for reminders`
    );

    for (const assignmentDoc of assignmentsSnap.docs) {
      const assignment = assignmentDoc.data() as {
        policyId: string;
        assignedTo: string[];
      };

      // Fetch the policy
      const policyDoc = await db
        .collection("policies")
        .doc(assignment.policyId)
        .get();
      if (!policyDoc.exists) continue;
      const policy = policyDoc.data() as {
        title: string;
        deletedAt?: admin.firestore.Timestamp | null;
      };
      if (policy.deletedAt) continue;

      for (const uid of assignment.assignedTo) {
        // Check if already acknowledged
        const ackId = `${assignment.policyId}_${uid}`;
        const ackDoc = await db.collection("acknowledgments").doc(ackId).get();
        if (ackDoc.exists) continue; // already acknowledged — skip

        // Fetch user email
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) continue;
        const userData = userDoc.data() as { email?: string };
        if (!userData.email) continue;

        // Send reminder email
        try {
          await transport.sendMail({
            from: FROM_ADDRESS,
            to: userData.email,
            subject: `Reminder: Please acknowledge "${policy.title}"`,
            html: `
              <p>Hi,</p>
              <p>
                You have a policy that requires your acknowledgment:
                <strong>${policy.title}</strong>
              </p>
              <p>
                Please log in to PolicyNexus and acknowledge this policy at your earliest convenience.
              </p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://policynexus.app"}/policies/${
              assignment.policyId
            }">
                  View &amp; Acknowledge Policy
                </a>
              </p>
              <p>Thank you,<br/>The PolicyNexus Team</p>
            `,
          });
          functions.logger.info(
            `Sent reminder to ${userData.email} for policy ${assignment.policyId}`
          );
        } catch (err) {
          functions.logger.error(
            `Failed to send reminder to ${userData.email}:`,
            err
          );
        }
      }
    }

    functions.logger.info("Acknowledgment reminder run complete.");
    return null;
  });
