import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // ONLY protect /portal/* routes — everything else passes through
  if (pathname.startsWith("/portal") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*"],
};
