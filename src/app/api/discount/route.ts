import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/discount?code=BARDIA25&amount=180&currency=USD
// Returns: { valid, discountType, discountValue, discountAmount, finalAmount, label }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const amount = Number(searchParams.get("amount") ?? 0);

    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, error: "No code provided" },
        { status: 400 }
      );
    }

    const [discount] = await db
      .select()
      .from(schema.discountCodes)
      .where(
        and(
          eq(schema.discountCodes.code, code),
          eq(schema.discountCodes.isActive, true)
        )
      )
      .limit(1);

    if (!discount) {
      return NextResponse.json({ success: true, valid: false, message: "Code not found or inactive." });
    }

    const now = new Date();
    if (discount.expiresAt && discount.expiresAt < now) {
      return NextResponse.json({ success: true, valid: false, message: "Code has expired." });
    }

    if (discount.maxUses !== null && discount.currentUses >= (discount.maxUses ?? 0)) {
      return NextResponse.json({ success: true, valid: false, message: "Code has reached its usage limit." });
    }

    const minOrder = Number(discount.minOrderAmount ?? 0);
    if (amount > 0 && amount < minOrder) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: `Minimum order of ${minOrder} required for this code.`,
      });
    }

    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = parseFloat(((amount * Number(discount.discountValue)) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(Number(discount.discountValue), amount);
    }

    const finalAmount = parseFloat((amount - discountAmount).toFixed(2));

    return NextResponse.json({
      success: true,
      valid: true,
      code,
      discountType: discount.discountType,
      discountValue: Number(discount.discountValue),
      discountAmount,
      finalAmount,
      label: `${code} (${discount.discountType === "percentage" ? `${discount.discountValue}% off` : `${discount.discountValue} off`})`,
    });
  } catch (err: any) {
    console.error("Discount validation error:", err);
    return NextResponse.json(
      { success: false, valid: false, error: err.message || "Failed to validate code" },
      { status: 500 }
    );
  }
}
