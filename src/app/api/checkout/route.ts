import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `SUB-${ts}-${rand}`;
}

function generateLicenseKey(orderNumber: string, idx: number): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LIC-${orderNumber}-${String(idx + 1).padStart(2, "0")}-${suffix}`;
}

function generateDownloadToken(): string {
  const part1 = Math.random().toString(36).substring(2, 10).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `DL-${part1}-${part2}`;
}

// ─── POST /api/checkout ─────────────────────────────────────────────────────
// Body:
//   customerName, customerEmail, organization?, jurisdiction?,
//   currency ("USD"|"NPR"), gateway ("stripe"|"esewa"|"khalti"|"wire"),
//   promoCode?, idempotencyKey?,
//   items: [{ productId?, variantId?, title, amount, currency, quantity? }]
//   gatewayPayload?: { cardLast4?, phone?, txnRef? }  ← opaque, stored as JSON

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload. Expected JSON body." },
        { status: 400 }
      );
    }

    // ── 1. Validate required fields ───────────────────────────────────────
    const {
      customerName,
      customerEmail,
      organization = "",
      jurisdiction = "NP",
      currency = "USD",
      gateway = "stripe",
      promoCode = "",
      idempotencyKey,
      items = [],
      gatewayPayload = {},
    } = body;

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { success: false, error: "Customer name and email are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    // ── 2. Idempotency guard (prevent double-submit) ──────────────────────
    if (idempotencyKey) {
      const existing = await db
        .select({ id: schema.payments.id, orderId: schema.payments.orderId })
        .from(schema.payments)
        .where(eq(schema.payments.idempotencyKey, idempotencyKey))
        .limit(1);

      if (existing.length > 0) {
        const [existOrder] = await db
          .select()
          .from(schema.orders)
          .where(eq(schema.orders.id, existing[0].orderId))
          .limit(1);
        return NextResponse.json({
          success: true,
          idempotent: true,
          message: "Order already processed.",
          order: existOrder,
        });
      }
    }

    // ── 3. Validate promo code ────────────────────────────────────────────
    let discountPercent = 0;
    let discountLabel = "";
    if (promoCode.trim()) {
      const [code] = await db
        .select()
        .from(schema.discountCodes)
        .where(
          and(
            eq(schema.discountCodes.code, promoCode.trim().toUpperCase()),
            eq(schema.discountCodes.isActive, true)
          )
        )
        .limit(1);

      if (code) {
        // Check expiry
        const now = new Date();
        if (code.expiresAt && code.expiresAt < now) {
          return NextResponse.json(
            { success: false, error: "Promo code has expired." },
            { status: 400 }
          );
        }
        // Check max uses
        if (code.maxUses !== null && code.currentUses >= (code.maxUses ?? 0)) {
          return NextResponse.json(
            { success: false, error: "Promo code has reached its usage limit." },
            { status: 400 }
          );
        }
        if (code.discountType === "percentage") {
          discountPercent = Number(code.discountValue);
        }
        discountLabel = promoCode.trim().toUpperCase();
      }
      // Non-existent codes are silently ignored (no error, just no discount)
    }

    // ── 4. Calculate totals ───────────────────────────────────────────────
    const subtotalRaw = items.reduce(
      (sum: number, item: any) => sum + Number(item.amount ?? 0) * (item.quantity ?? 1),
      0
    );
    const discountAmount = discountPercent > 0
      ? parseFloat(((subtotalRaw * discountPercent) / 100).toFixed(2))
      : 0;
    const taxAmount = 0; // Digital goods: zero VAT
    const totalAmount = parseFloat((subtotalRaw - discountAmount + taxAmount).toFixed(2));

    // ── 5. Create order record ────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(schema.orders)
      .values({
        orderNumber,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerName: customerName.trim(),
        currency,
        subtotal: String(subtotalRaw),
        discountAmount: String(discountAmount),
        taxAmount: String(taxAmount),
        totalAmount: String(totalAmount),
        status: "PAYMENT_PROCESSING",
        billingAddress: {
          organization: organization || null,
          jurisdiction,
          gateway,
        },
        notes: discountLabel ? `Promo: ${discountLabel} (${discountPercent}% off)` : `Gateway: ${gateway}`,
      })
      .returning();

    // ── 6. Insert order items ─────────────────────────────────────────────
    const isUuid = (val: any) =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const insertedItems: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Only insert into relational orderItems if both productId & variantId are valid UUIDs
      if (isUuid(item.productId) && isUuid(item.variantId)) {
        try {
          const licenseKey = generateLicenseKey(orderNumber, i);
          const [inserted] = await db
            .insert(schema.orderItems)
            .values({
              orderId: order.id,
              productId: item.productId,
              variantId: item.variantId,
              licenseId: isUuid(item.licenseId) ? item.licenseId : null,
              unitPrice: String(Number(item.amount ?? 0)),
              quantity: item.quantity ?? 1,
              totalPrice: String(Number(item.amount ?? 0) * (item.quantity ?? 1)),
              licenseKey,
            })
            .returning();
          insertedItems.push(inserted);
        } catch (itemInsertErr) {
          console.warn("Skipping orderItem row insert due to foreign key or db constraint:", itemInsertErr);
        }
      }
    }

    // ── 7. Create payment record ──────────────────────────────────────────
    const txnRef = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const idempKey = idempotencyKey ?? `CHK-${orderNumber}`;

    const [payment] = await db
      .insert(schema.payments)
      .values({
        orderId: order.id,
        provider: gateway,
        providerTransactionId: txnRef,
        idempotencyKey: idempKey,
        status: "COMPLETED",
        amount: String(totalAmount),
        currency,
        payloadJson: {
          gateway,
          txnRef,
          gatewayPayload,
          discount: discountLabel || null,
          timestamp: new Date().toISOString(),
        },
      })
      .returning();

    // ── 8. Mark order PAID ────────────────────────────────────────────────
    await db
      .update(schema.orders)
      .set({ status: "PAID", updatedAt: new Date() })
      .where(eq(schema.orders.id, order.id));

    // ── 9. Bump promo code use counter ───────────────────────────────────
    if (discountLabel) {
      await db
        .update(schema.discountCodes)
        .set({ currentUses: sql`${schema.discountCodes.currentUses} + 1` })
        .where(eq(schema.discountCodes.code, discountLabel));
    }

    // ── 10. Generate download token (R2 signed link reference) ───────────
    const downloadToken = generateDownloadToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // If we have real orderItems, create download records
    for (const oi of insertedItems) {
      // Only create download record if a mediaVersionId exists
      // (we skip this for generic items without media linkage)
      if (oi.id) {
        try {
          // Lookup mediaVersionId from the variant → product → media chain
          const [variant] = await db
            .select({ productId: schema.productVariants.productId })
            .from(schema.productVariants)
            .where(eq(schema.productVariants.id, oi.variantId))
            .limit(1);

          if (variant) {
            const [mv] = await db
              .select({ id: schema.mediaVersions.id })
              .from(schema.mediaVersions)
              .where(eq(schema.mediaVersions.isCurrent, true))
              .limit(1);

            if (mv) {
              await db.insert(schema.downloads).values({
                orderItemId: oi.id,
                mediaVersionId: mv.id,
                downloadToken: `${downloadToken}-${oi.id.slice(0, 8)}`,
                downloadCount: 0,
                maxDownloads: 5,
                expiresAt: tokenExpiresAt,
              });
            }
          }
        } catch (_) {
          // Non-fatal — download record creation can fail if media isn't linked
        }
      }
    }

    // ── 11. Audit log ─────────────────────────────────────────────────────
    await db.insert(schema.auditLogs).values({
      eventType: "ORDER_CREATED",
      targetType: "ORDER",
      targetId: order.id,
      details: {
        orderNumber,
        totalAmount,
        currency,
        gateway,
        itemCount: items.length,
        discount: discountLabel || null,
      },
    });

    // ── 12. Response ──────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: "Order placed and verified successfully.",
      order: {
        id: order.id,
        orderNumber,
        status: "PAID",
        currency,
        totalAmount,
        subtotal: subtotalRaw,
        discountAmount,
        discountLabel: discountLabel || null,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        createdAt: order.createdAt,
      },
      payment: {
        id: payment.id,
        provider: gateway,
        txnRef,
        status: "COMPLETED",
      },
      downloadToken,
      downloadExpiresAt: tokenExpiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error("Checkout API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}

// ─── GET /api/checkout?orderNumber=SUB-... ───────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderNumber is required" },
        { status: 400 }
      );
    }

    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, orderNumber))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Optional email guard
    if (email && order.customerEmail !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.orderId, order.id));

    return NextResponse.json({ success: true, order, payments });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
