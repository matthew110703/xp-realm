import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export default auth((req) => {
  const request = req as unknown as NextRequest;
  const { pathname } = request.nextUrl;
  const session = req.auth;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected =
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/discover") ||
    pathname.startsWith("/social") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/setup");

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/jobs", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|workbox-.*\\.js).*)"],
};
