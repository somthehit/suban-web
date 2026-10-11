import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(50).optional().nullable(),
  image: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email?.toLowerCase();
    const userRecords = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        image: users.image,
        status: users.status,
        twoFactorEnabled: users.twoFactorEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(email ? eq(users.email, email) : eq(users.id, session.user.id))
      .limit(1);

    if (userRecords.length === 0) {
      // Return session user as fallback
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name || "Collector",
          email: session.user.email || "",
          phone: "",
          image: session.user.image || null,
          status: "active",
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ user: userRecords[0] });
  } catch (error) {
    console.warn("GET customer profile DB unreachable, using session user fallback:", (error as any)?.message || error);
    try {
      const session = await auth();
      if (session?.user) {
        return NextResponse.json({
          user: {
            id: session.user.id || "temp-collector",
            name: session.user.name || "Collector",
            email: session.user.email || "",
            phone: "",
            image: session.user.image || null,
            status: "active",
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
          },
          fallback: true,
        });
      }
    } catch {}
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, phone, image } = validated.data;
    const email = session.user.email?.toLowerCase();

    const updateData: {
      name: string;
      phone?: string | null;
      image?: string | null;
      updatedAt: Date;
    } = {
      name,
      updatedAt: new Date(),
    };

    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image;

    if (email) {
      await db.update(users).set(updateData).where(eq(users.email, email));
    } else {
      await db.update(users).set(updateData).where(eq(users.id, session.user.id));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: { name, phone, image },
    });
  } catch (error) {
    console.error("PATCH customer profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
