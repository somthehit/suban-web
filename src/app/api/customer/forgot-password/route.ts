import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();

    // Verify user exists in database
    const userRecords = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    // If user exists, send reset email
    if (userRecords.length > 0) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      // We pass the email to set-password route
      const resetUrl = `${appUrl}/customer/set-password?email=${encodeURIComponent(emailClean)}`;
      
      await sendPasswordResetEmail(emailClean, resetUrl);
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, password reset instructions have been dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset. Please try again." },
      { status: 500 }
    );
  }
}
