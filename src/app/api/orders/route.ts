import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const orders = await db
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        status: schema.orders.status,
        currency: schema.orders.currency,
        totalAmount: schema.orders.totalAmount,
        customerEmail: schema.orders.customerEmail,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err: any) {
    console.error("Orders API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, currency = "USD", totalAmount = 45, gateway = "stripe", items = [] } = body;

    const orderNumber = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const [order] = await db
      .insert(schema.orders)
      .values({
        orderNumber,
        customerEmail: customerEmail || "collector@domain.com",
        customerName: body.customerName || "Collector",
        currency,
        subtotal: String(totalAmount),
        taxAmount: "0.00",
        discountAmount: "0.00",
        totalAmount: String(totalAmount),
        status: "PAID",
        notes: `Gateway: ${gateway}, Items: ${items.length}`,
      })
      .returning();

    // Create Payment record
    const [payment] = await db
      .insert(schema.payments)
      .values({
        orderId: order.id,
        provider: gateway,
        providerTransactionId: `TXN-${Date.now()}`,
        status: "COMPLETED",
        amount: String(totalAmount),
        currency,
        payloadJson: { simulated: true, timestamp: new Date().toISOString() },
      })
      .returning();

    // Log to audit
    await db.insert(schema.auditLogs).values({
      eventType: "ORDER_CREATED",
      targetType: "ORDER",
      targetId: order.id,
      details: { orderNumber, totalAmount, gateway },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed and verified successfully",
      order: {
        ...order,
        payment,
      },
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
