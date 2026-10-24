import { parseSetCookie } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  let isAuthenticated = Boolean(accessToken);
  let refreshedCookies: ReturnType<typeof parseSetCookie>[] = [];

  if (!accessToken && refreshToken) {
    const requestCookieHeader = request.cookies
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    const session = await checkSession(requestCookieHeader);
    isAuthenticated = session.data.success;

    const setCookie = session.headers["set-cookie"];
    if (setCookie) {
      const cookieHeaders = Array.isArray(setCookie) ? setCookie : [setCookie];
      refreshedCookies = cookieHeaders.map((cookieHeader) =>
        parseSetCookie(cookieHeader),
      );

      for (const { name, value } of refreshedCookies) {
        if (value) {
          request.cookies.set(name, value);
        }
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (refreshedCookies.length > 0) {
    requestHeaders.set(
      "cookie",
      request.cookies
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; "),
    );
  }

  const withRefreshedCookies = (response: NextResponse) => {
    for (const { name, value, ...options } of refreshedCookies) {
      if (value) {
        response.cookies.set(name, value, options);
      }
    }
    return response;
  };

  if (isPrivateRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    withRefreshedCookies(response);
    return response;
  }

  if (isPublicRoute && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/profile", request.url));
    withRefreshedCookies(response);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return withRefreshedCookies(response);
}

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/notes",
    "/notes/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
