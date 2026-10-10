import { NextResponse } from "next/server";
import { getViewer, supabaseAdmin } from "../../../../../lib/supabase";

// Admin preview of the current Service Agreement PDF.
export async function GET(request, { params }) {
  const { profile } = await getViewer();
  if (profile?.role !== "admin") return NextResponse.redirect(new URL("/login", request.url));
  const { lang } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin.from("agency_settings").select("value").eq("key", `agreement_${lang === "es" ? "es" : "en"}`).maybeSingle();
  if (!data?.value) return new NextResponse("Not uploaded yet", { status: 404 });
  const { data: signed } = await admin.storage.from("artist-files").createSignedUrl(data.value, 120);
  if (!signed?.signedUrl) return new NextResponse("Not available", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
