import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path EXCEPT:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon, robots, sitemap, public files (anything with a file extension)
     * Auth cookies still need to refresh on auth routes themselves, so we
     * don't exclude /auth or /login here.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
