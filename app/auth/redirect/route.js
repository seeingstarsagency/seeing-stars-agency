import { NextResponse } from "next/server";
import { getViewer } from "../../../lib/supabase";

// Sends each person to the right place after logging in.
export async function GET(request) {
  const { user, profile } = await getViewer();
  const dest = !user ? "/login" : profile?.role === "admin" ? "/admin" : "/dashboard";
  return NextResponse.redirect(new URL(dest, request.url));
}
