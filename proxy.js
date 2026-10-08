import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from "./lib/env";

// Keeps the login session fresh and protects private pages.
export async function proxy(request) {
  let response = NextResponse.next({ request });
  const url = SUPABASE_URL();
  const anon = SUPABASE_PUBLIC_KEY();
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers || {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPrivate = path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/report") || path.startsWith("/account") || path.startsWith("/files");

  if (isPrivate && !data?.user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/report/:path*", "/account/:path*", "/files/:path*", "/login", "/auth/:path*"],
};
