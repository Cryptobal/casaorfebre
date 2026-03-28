import { NextResponse } from "next/server";

const FACEBOOK_PROFILE =
  "https://www.facebook.com/profile.php?id=61576780358505";

/** Redirección interna: evita que extensiones bloqueen enlaces con href a facebook.com en el footer. */
export function GET() {
  return NextResponse.redirect(FACEBOOK_PROFILE, 302);
}
