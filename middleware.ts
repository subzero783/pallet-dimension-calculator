import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "production_super_secret_jwt_key_at_least_32_chars_long_12345";
const key = new TextEncoder().encode(JWT_SECRET);
const AUTH_COOKIE_NAME = "pallet_calc_auth";

// Routes that require an authenticated user
const PROTECTED_PREFIXES = ["/history", "/api/work-orders"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If hitting login page while already authenticated, redirect to /calculator
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, key, { algorithms: ["HS256"] });
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  if (pathname === "/login" && isValidToken) {
    return NextResponse.redirect(new URL("/calculator", req.url));
  }

  if (isProtected) {
    if (!isValidToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/history/:path*",
    "/api/work-orders/:path*",
    "/login",
  ],
};
