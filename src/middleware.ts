import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy route redirect
  if (pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account") || pathname.startsWith("/customer/dashboard");

  if (!isAdminRoute && !isAccountRoute) {
    return NextResponse.next();
  }

  // NextAuth v5 session token extraction
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || "suban-photography-dev-secret-key-neon-tokyo-2026",
    salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
  });

  // 1. ADMIN ROUTE PROTECTION
  if (isAdminRoute) {
    if (!token) {
      // In development, allow bypass only if explicit query or env flag, otherwise enforce staff login
      const url = new URL("/internal/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const role = (token.role as string) || "CUSTOMER";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "EDITOR") {
      // Customer trying to access Admin suite -> 403 / unauthorized
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 2. CUSTOMER ACCOUNT ROUTE PROTECTION
  if (isAccountRoute) {
    if (!token) {
      const url = new URL("/customer/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/customer/dashboard/:path*", "/auth/login"],
};
