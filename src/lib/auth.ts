import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Role } from "./rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        try {
          const userRecords = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              passwordHash: users.passwordHash,
              roleId: users.roleId,
              status: users.status,
              image: users.image,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = userRecords[0];
          if (!user || !user.passwordHash || user.status !== "active") {
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            return null;
          }

          let userRole: Role = "CUSTOMER";
          if (user.roleId) {
            const roleRecord = await db
              .select({ name: roles.name })
              .from(roles)
              .where(eq(roles.id, user.roleId))
              .limit(1);
            if (roleRecord[0]?.name) {
              userRole = roleRecord[0].name as Role;
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: userRole,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          // Fallback demo user for local test without DB configured
          if (email === "admin@subanphotography.com" && password === "Admin@123456") {
            return {
              id: "seed-superadmin-id",
              name: "Suban Photographer",
              email: "admin@subanphotography.com",
              role: "SUPER_ADMIN" as Role,
            };
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const emailLower = user.email.toLowerCase();
          const existingUser = await db
            .select({ id: users.id, roleId: users.roleId })
            .from(users)
            .where(eq(users.email, emailLower))
            .limit(1);

          if (existingUser.length === 0) {
            // Find or create CUSTOMER role
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

            const createdUser = await db
              .insert(users)
              .values({
                name: user.name || "Collector",
                email: emailLower,
                image: user.image,
                emailVerified: new Date(),
                roleId,
                status: "active",
              })
              .returning({ id: users.id });

            user.id = createdUser[0].id;
            user.role = "CUSTOMER";
          } else {
            user.id = existingUser[0].id;
            if (existingUser[0].roleId) {
              const roleRecord = await db
                .select({ name: roles.name })
                .from(roles)
                .where(eq(roles.id, existingUser[0].roleId))
                .limit(1);
              if (roleRecord[0]?.name) {
                user.role = roleRecord[0].name as Role;
              }
            }
          }
        } catch (err) {
          console.error("Google signIn DB sync error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "CUSTOMER";
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      // Only query DB on profile update or when role/picture is missing to keep session requests instant (<10ms)
      if ((trigger === "update" || !token.role) && token.email) {
        try {
          const userRec = await db
            .select({ roleId: users.roleId, image: users.image, name: users.name })
            .from(users)
            .where(eq(users.email, (token.email as string).toLowerCase()))
            .limit(1);
          if (userRec[0]?.roleId) {
            const roleRec = await db
              .select({ name: roles.name })
              .from(roles)
              .where(eq(roles.id, userRec[0].roleId))
              .limit(1);
            if (roleRec[0]?.name) {
              token.role = roleRec[0].name as Role;
            }
          }
          if (userRec[0]?.image) {
            token.picture = userRec[0].image;
          }
          if (userRec[0]?.name) {
            token.name = userRec[0].name;
          }
        } catch {
          // Keep existing token.role if DB query fails
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as Role) || "CUSTOMER";
        if (token.picture) session.user.image = token.picture as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/customer/login",
    error: "/customer/login",
  },
  secret: process.env.AUTH_SECRET || "suban-photography-dev-secret-key-neon-tokyo-2026",
});

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN: Insufficient permissions");
  }
  return user;
}
