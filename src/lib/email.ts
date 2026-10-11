import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates and caches a Nodemailer transport instance using Google SMTP or custom provider.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || "subanphotography@gmail.com";
  // Remove spaces if copied from Google App Password format (e.g. "xxxx xxxx xxxx xxxx")
  const rawPass = process.env.SMTP_PASS || "oyna ezsi xupx ggcs";
  const pass = rawPass.replace(/\s+/g, "");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends an email via Google SMTP (Gmail App Password) or configured provider.
 */
export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.EMAIL_FROM || `SUBAN Photography <${process.env.SMTP_USER || "subanphotography@gmail.com"}>`;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""),
    });

    console.log(`[Email Delivered] To: ${to} | Subject: "${subject}" | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Email Delivery Error]:", error?.message || error);
    // In dev mode, return graceful failure without crashing the request
    return { success: false, error: error?.message || "Failed to dispatch email." };
  }
}

/**
 * Sends a Collector password reset link email.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset Your SUBAN Photography Collector Password";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030e06; color: #f1f5f9; padding: 40px 30px; border-radius: 16px; border: 1px solid #163e26;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; font-size: 28px; letter-spacing: 2px; margin: 0; font-weight: 800;">SUBAN</h1>
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">Fine Art Wildlife Photography</p>
      </div>

      <div style="background-color: #06180e; padding: 30px; border-radius: 12px; border: 1px solid #163e26; margin-bottom: 30px;">
        <h2 style="font-size: 18px; margin-top: 0; color: #ffffff; font-weight: 600;">Password Reset Request</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          We received a request to reset the password for your Collector Portal account associated with <strong>${to}</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: #020d06; padding: 14px 28px; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 10px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
            Set New Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          If you did not initiate this request, you can safely disregard this email. Your collector credentials will remain secure. This link expires in 60 minutes.
        </p>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 11px;">
        <p>© ${new Date().getFullYear()} SUBAN Wildlife Photography. All rights reserved.</p>
        <p>Kathmandu & Chitwan, Nepal | Wild Horizons</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Sends a welcome email upon collector account creation.
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = "Welcome to SUBAN Wildlife Photography";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030e06; color: #f1f5f9; padding: 40px 30px; border-radius: 16px; border: 1px solid #163e26;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; font-size: 28px; letter-spacing: 2px; margin: 0; font-weight: 800;">SUBAN</h1>
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">Fine Art Wildlife Photography</p>
      </div>

      <div style="background-color: #06180e; padding: 30px; border-radius: 12px; border: 1px solid #163e26; margin-bottom: 30px;">
        <h2 style="font-size: 18px; margin-top: 0; color: #ffffff; font-weight: 600;">Welcome, ${name}</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Your collector account has been registered. You now have direct access to our limited-edition print archive, certificates of authenticity, and high-resolution licensing downloads.
        </p>
        <div style="text-align: center; margin: 26px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account" style="background-color: #10b981; color: #020d06; padding: 12px 24px; font-weight: 700; font-size: 12px; text-decoration: none; border-radius: 10px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
            Open Collector Portal
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}
