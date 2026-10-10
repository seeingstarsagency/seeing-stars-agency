import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { loadQuoteByToken } from "../../load";

// The Service Agreement for the artist who holds this quote link.
export async function GET(request, { params }) {
  const { token } = await params;
  const r = await loadQuoteByToken(token);
  if (r.state === "missing") return new NextResponse("Not found", { status: 404 });
  const admin = supabaseAdmin();
  // The exact file sent with this quote; older quotes (sent before that was recorded) use the general one.
  let path = r.quote.sent_agreement;
  if (!path) {
    const { data } = await admin.from("agency_settings").select("value").eq("key", `agreement_${r.lang}`).maybeSingle();
    path = data?.value;
  }
  if (!path) return new NextResponse("Not available", { status: 404 });
  const { data: signed } = await admin.storage.from("artist-files").createSignedUrl(path, 300);
  if (!signed?.signedUrl) return new NextResponse("Not available", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
