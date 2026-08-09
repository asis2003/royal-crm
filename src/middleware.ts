import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLogin = req.nextUrl.pathname.startsWith("/login");
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();
  if (!isLoggedIn && !isOnLogin) return NextResponse.redirect(new URL("/login", req.nextUrl));
  if (isLoggedIn && isOnLogin) return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};