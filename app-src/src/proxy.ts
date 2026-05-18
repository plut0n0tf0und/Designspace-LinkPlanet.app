import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if path needs protection
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
