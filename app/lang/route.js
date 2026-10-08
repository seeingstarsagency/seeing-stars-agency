import { NextResponse } from "next/server";

// /lang?to=es&next=/dashboard → remembers the language and goes back.
export function GET(request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to") === "es" ? "es" : "en";
  let next = url.searchParams.get("next") || "/";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/";
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set("lang", to, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
