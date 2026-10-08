import { NextResponse } from "next/server";
import { getViewer, supabaseAdmin } from "../../../lib/supabase";

// Download a file: only works if the visitor is allowed to see it.
export async function GET(request, { params }) {
  const { id } = await params;
  const { user, supabase } = await getViewer();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  // Row level security decides whether this row is visible to this person.
  const { data: file } = await supabase.from("artist_files").select("path, name").eq("id", id).maybeSingle();
  if (!file) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await supabaseAdmin().storage.from("artist-files").createSignedUrl(file.path, 60, { download: file.name });
  if (error || !data?.signedUrl) return new NextResponse("Not available", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
