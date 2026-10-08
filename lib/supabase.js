import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY, SUPABASE_SECRET_KEY } from "./env";

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL() && SUPABASE_PUBLIC_KEY());
}

// Client acting as the signed-in visitor. Row level security applies.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL(), SUPABASE_PUBLIC_KEY(), {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

// Server-only client with full access. Never import this from client components.
export function supabaseAdmin() {
  const url = SUPABASE_URL();
  const key = SUPABASE_SECRET_KEY();
  if (!url || !key) throw new Error("Supabase service key is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Who is visiting: { user, profile } or nulls.
export async function getViewer() {
  if (!supabaseConfigured()) return { user: null, profile: null };
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  if (!user) return { user: null, profile: null, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, artist_id")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile: profile ?? null, supabase };
}
