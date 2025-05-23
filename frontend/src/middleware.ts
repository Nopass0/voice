// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  /* === 0. Корень сайта → /trader ===================================== */
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/trader";
    return NextResponse.redirect(url);
  }

  /* === 1. Админ-раздел (/admin/**) ==================================== */
  if (pathname.startsWith("/admin")) {
    const adminKey = req.cookies.get("x-admin-key")?.value;
    const isAuthPage =
      pathname === "/admin/auth" || pathname.startsWith("/admin/auth/");

    // не авторизован → пускаем только на /admin/auth
    if (!adminKey && !isAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/auth";
      url.searchParams.set(
        "redirect",
        pathname + (searchParams ? `?${searchParams}` : ""),
      );
      return NextResponse.redirect(url);
    }

    // уже авторизован, но пытается открыть форму логина
    if (adminKey && isAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // всё в порядке
    return NextResponse.next();
  }

  /* === 2. Трейдер-раздел (/trader/**) ================================= */
  if (pathname.startsWith("/trader")) {
    const traderToken = req.cookies.get("x-trader-token")?.value;
    const isTraderAuthPage =
      pathname === "/trader/auth" || pathname.startsWith("/trader/auth/");

    // нет токена → пускаем только на /trader/auth
    if (!traderToken && !isTraderAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/trader/auth";
      url.searchParams.set(
        "redirect",
        pathname + (searchParams ? `?${searchParams}` : ""),
      );
      return NextResponse.redirect(url);
    }

    // токен есть, но пользователь на странице авторизации
    if (traderToken && isTraderAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/trader";
      return NextResponse.redirect(url);
    }

    // всё в порядке
    return NextResponse.next();
  }

  /* === 3. Остальные страницы — пропускаем ============================= */
  return NextResponse.next();
}

/* Ограничиваем работу middleware только на нужных URL-ах */
export const config = {
  matcher: ["/", "/admin/:path*", "/trader/:path*"],
};
