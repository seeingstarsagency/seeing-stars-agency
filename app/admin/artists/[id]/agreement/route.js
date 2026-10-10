import { NextResponse } from "next/server";
import { getViewer, supabaseAdmin } from "../../../../../lib/supabase";

// Admin preview of one artist's own Service Agreement PDF.
export async function GET(request, { params }) {
  const { profile } = await getViewer();
  if (profile?.role !== "admin") return NextResponse.redirect(new URL("/login", request.url));
  const { id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin.from("artist_quotes").select("agreement_path, sent_agreement, accepted_at").eq("artist_id", id).maybeSingle();
  // After acceptance, show the file they accepted.
  const path = (data?.accepted_at && data?.sent_agreement) || data?.agreement_path;
  if (!path) return new NextResponse("No agreement for this artist", { status: 404 });
  const { data: signed } = await admin.storage.from("artist-files").createSignedUrl(path, 120);
  if (!signed?.signedUrl) return new NextResponse("Not available", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
