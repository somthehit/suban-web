import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pankzkpnhibendxhynf.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (supabaseAnonKey) {
      try {
        // 1. Exchange code for Supabase session via REST endpoint
        const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ auth_code: code }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const authUser = tokenData?.user;

          if (authUser?.email) {
            const emailLower = authUser.email.toLowerCase();

            // 2. Check if user already exists in PostgreSQL
            const existingUser = await db
              .select({ id: users.id, roleId: users.roleId, passwordHash: users.passwordHash })
              .from(users)
              .where(eq(users.email, emailLower))
              .limit(1);

            if (existingUser.length === 0) {
              // Ensure CUSTOMER role exists
              const customerRole = await db
                .select({ id: roles.id })
                .from(roles)
                .where(eq(roles.name, "CUSTOMER"))
                .limit(1);

              let roleId = customerRole[0]?.id;
              if (!roleId) {
                const created = await db
                  .insert(roles)
                  .values({
                    name: "CUSTOMER",
                    description: "Fine art print collector and website visitor account",
                    permissions: ["orders:read", "downloads:read", "profile:manage"],
                  })
                  .returning({ id: roles.id });
                roleId = created[0]?.id;
              }

              await db.insert(users).values({
                name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "Collector",
                email: emailLower,
                image: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                emailVerified: new Date(),
                roleId,
                status: "active",
              });

              // Newly registered via OAuth: redirect to optional password setup
              return NextResponse.redirect(`${origin}/customer/set-password?next=${encodeURIComponent(next)}&email=${encodeURIComponent(emailLower)}`);
            }
          }
        }
      } catch (err) {
        console.error("Supabase OAuth code exchange error:", err);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
