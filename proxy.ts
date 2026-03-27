import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // ONLY protect /portal/* routes — everything else passes through
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const email = req.auth.user?.email || "";
  const realRole = req.auth.user?.role || "BUYER";

  // For role-switcher admins, we read activeRole from a header cookie approach
  // Since we can't query DB in middleware easily, we rely on the portal layout
  // to do the full activeRole check. The proxy just ensures basic auth.

  // Admins with role-switcher access always get through to any portal
  if (ROLE_SWITCHER_EMAILS.includes(email) && realRole === "ADMIN") {
    return NextResponse.next();
  }

  // Standard role-based access
  if (pathname.startsWith("/portal/admin") && realRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/portal/comprador/pedidos", req.nextUrl));
  }

  if (pathname.startsWith("/portal/orfebre") && realRole !== "ARTISAN" && realRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/portal/comprador/pedidos", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*"],
};
