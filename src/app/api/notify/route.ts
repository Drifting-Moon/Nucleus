import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  let body: {
    userId?: string;
    type?: "submit" | "approve" | "reject" | "reminder";
    rejectionReason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, type, rejectionReason } = body;

  if (!userId || !type) {
    return NextResponse.json({ error: "userId and type are required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch employee details
  const { data: employee, error: empError } = await supabase
    .from("users")
    .select("id, name, email, manager_id")
    .eq("id", userId)
    .single();

  if (empError || !employee) {
    console.error("[Notify API] Error fetching employee profile:", empError);
    return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
  }

  const employeeName = employee.name || employee.email || "Employee";
  const employeeEmail = employee.email;

  if (!employeeEmail) {
    return NextResponse.json({ error: "Employee email not found" }, { status: 400 });
  }

  try {
    if (type === "submit") {
      // Notify manager if they exist
      if (!employee.manager_id) {
        return NextResponse.json({ success: true, message: "No manager assigned to notify." });
      }

      const { data: manager, error: mgrError } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", employee.manager_id)
        .single();

      if (mgrError || !manager || !manager.email) {
        console.error("[Notify API] Error fetching manager for notification:", mgrError);
        return NextResponse.json({ error: "Manager profile not found" }, { status: 404 });
      }

      const managerName = manager.name || "Manager";
      const managerEmail = manager.email;

      const html = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0F0F0F; color: #F5F0E8; padding: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); max-width: 600px; margin: 0 auto;">
          <h2 style="font-family: 'DM Serif Display', serif; color: #F5F0E8; font-size: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">Goal Sheet Submitted</h2>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">Hello ${managerName},</p>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            <strong>${employeeName}</strong> has completed and submitted their Goal Sheet for the active cycle <strong>FY 2026–27</strong>.
          </p>
          <div style="background-color: #161616; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 12px; color: #8A8A8A;">Status: <span style="color: #4A6FA5; font-weight: bold; text-transform: uppercase;">Awaiting Review</span></p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #8A8A8A;">Employee Email: <span style="color: #F5F0E8;">${employeeEmail}</span></p>
          </div>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            Please log in to your manager dashboard to review, adjust weightages, or approve their goal worksheet.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-t: 1px solid rgba(255,255,255,0.08); text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nucleus.vercel.app'}/login" style="background-color: #4A6FA5; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">Go to Manager Portal</a>
          </div>
        </div>
      `;

      const result = await sendEmail({
        to: managerEmail,
        subject: `[Nucleus] Goal Sheet Submitted by ${employeeName}`,
        html,
      });

      return NextResponse.json(result);
    }

    if (type === "approve") {
      const html = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0F0F0F; color: #F5F0E8; padding: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); max-width: 600px; margin: 0 auto;">
          <h2 style="font-family: 'DM Serif Display', serif; color: #F5F0E8; font-size: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">Goal Sheet Approved</h2>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">Hello ${employeeName},</p>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            We are pleased to inform you that your Goal Sheet for <strong>FY 2026–27</strong> has been officially reviewed and <strong>Approved</strong> by your manager.
          </p>
          <div style="background-color: #161616; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 12px; color: #8A8A8A;">Status: <span style="color: #10B981; font-weight: bold; text-transform: uppercase;">Approved &amp; Locked</span></p>
          </div>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            Your goals are now locked for the current cycle. You will be able to perform quarterly check-ins and submit achievement metrics once the respective windows open.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-t: 1px solid rgba(255,255,255,0.08); text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nucleus.vercel.app'}/login" style="background-color: #4A6FA5; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">View Goal Sheet</a>
          </div>
        </div>
      `;

      const result = await sendEmail({
        to: employeeEmail,
        subject: `[Nucleus] Your Goal Sheet has been Approved`,
        html,
      });

      return NextResponse.json(result);
    }

    if (type === "reject") {
      const reason = rejectionReason || "Please review your goals and verify target alignment with department specifications.";

      const html = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0F0F0F; color: #F5F0E8; padding: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); max-width: 600px; margin: 0 auto;">
          <h2 style="font-family: 'DM Serif Display', serif; color: #EF4444; font-size: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">Goal Sheet Returned for Revision</h2>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">Hello ${employeeName},</p>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            Your Goal Sheet has been returned by your manager for further edits and revision.
          </p>
          <div style="background-color: #1C1515; border: 1px solid #EF4444; border-radius: 4px; padding: 16px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #EF4444; font-weight: bold;">Manager Feedback / Rejection Reason:</h4>
            <p style="margin: 0; font-size: 12px; color: #F5F0E8; line-height: 1.5; font-style: italic;">"${reason}"</p>
          </div>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            Please log back into the employee portal to adjust your goal details, thrust areas, or weightages, and submit it again for manager approval.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-t: 1px solid rgba(255,255,255,0.08); text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nucleus.vercel.app'}/login" style="background-color: #4A6FA5; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">Edit Goal Sheet</a>
          </div>
        </div>
      `;

      const result = await sendEmail({
        to: employeeEmail,
        subject: `[Nucleus] Goal Sheet Returned for Revision`,
        html,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported notification type" }, { status: 400 });
  } catch (err: any) {
    console.error("[Notify API] Uncaught Exception:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
