import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  // Match all paths except API/auth/admin routes, Next internals and static
  // files. /admin lives outside the [locale] tree and has its own auth.
  matcher: ["/((?!api|auth|admin|_next|_vercel|.*\\..*).*)"],
};
