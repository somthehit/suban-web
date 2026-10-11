import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Find CUSTOMER role
    let customerRole = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "CUSTOMER"))
      .limit(1);

    let roleId = customerRole[0]?.id;

    // If CUSTOMER role does not exist yet, create it
    if (!roleId) {
      const createdRoles = await db
        .insert(roles)
        .values({
          name: "CUSTOMER",
          description: "Fine art print collector and website visitor account",
          permissions: ["orders:read", "downloads:read", "profile:manage"],
        })
        .returning({ id: roles.id });
      roleId = createdRoles[0]?.id;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new customer user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        roleId,
        status: "active",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    // Dispatch welcome email asynchronously via Google SMTP
    sendWelcomeEmail(email, name).catch((err) =>
      console.warn("Welcome email async notice:", err?.message || err)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Collector account created successfully",
        user: newUser[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { error: "Unable to complete registration. Please try again later." },
      { status: 500 }
    );
  }
}
