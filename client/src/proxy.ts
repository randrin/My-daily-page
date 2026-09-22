import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes("authjs.session-token") ||
        cookie.name.includes("next-auth.session-token"),
    );
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (hasAuthCookie(request)) {
    return NextResponse.next();
  }

  const signIn = new URL("/auth/signin", request.nextUrl.origin);
  signIn.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
