import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const {
    nextUrl: { pathname },
  } = req;

  if (
    pathname.startsWith("/ko") ||
    pathname.startsWith("/en") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/")
  ) {
    const locale = pathname.startsWith("/ko") ? "ko" : "en";
    const response = NextResponse.next();
    response.cookies.set("locale", locale);
    return response;
  }

  const lang =
    req.headers.get("accept-language")?.split(",")[0].split("-")[0] || "en";
  const targetLocale = lang === "ko" ? "ko" : "en";

  const res = NextResponse.redirect(
    new URL(`/${targetLocale}${pathname}`, req.url)
  );
  res.cookies.set("locale", targetLocale);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
