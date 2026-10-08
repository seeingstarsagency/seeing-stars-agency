import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";

// Landing spot for links in emails (invite, login link, password reset).
export async function GET(request) {
  const url = new URL(request.url);
  let next = url.searchParams.get("next") || "/auth/redirect";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/auth/redirect";

  const supabase = await supabaseServer();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }
  return NextResponse.redirect(new URL(ok ? next : "/login?error=link", url.origin));
}
