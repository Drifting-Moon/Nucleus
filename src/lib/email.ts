import { Resend } from "resend";

// Initialize Resend with fail-safe check
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey && apiKey !== "re_mock" ? new Resend(apiKey) : null;

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Robust, fail-safe email sender that uses Resend if API Key is configured,
 * otherwise gracefully falls back to console logging to prevent application crashes.
 */
export async function sendEmail({ to, subject, html }: SendEmailPayload) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Nucleus <noreply@nucleus-goals.app>";

  try {
    if (resend) {
      console.log(`[Email] Sending real email via Resend to ${to}: "${subject}"`);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        console.error("[Email] Resend API returned error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } else {
      // Graceful fallback for local development or missing key during demo/hackathon
      console.log("=========================================");
      console.log(`[Email Fallback - MOCK] Simulated Email Sent!`);
      console.log(`To:      ${to}`);
      console.log(`From:    ${fromEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html.replace(/<[^>]*>/g, " ").trim().substring(0, 150)}...`);
      console.log("=========================================");
      return { success: true, id: `mock-${Date.now()}` };
    }
  } catch (error: any) {
    console.error("[Email] Exception caught during sending:", error);
    // Never let email failure crash an active transaction or request
    return { success: false, error: error?.message || "Unknown error" };
  }
}
