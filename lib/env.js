// Reads settings from Vercel. Accepts several common names so setup is forgiving.
// Server-only: never import this from a "use client" file.
const pick = (...names) => {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
};

export const SUPABASE_URL = () => pick("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
export const SUPABASE_PUBLIC_KEY = () =>
  pick("NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_KEY");
export const SUPABASE_SECRET_KEY = () => pick("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SERVICE_ROLE_KEY", "ROLE_KEY");
export const SITE_URL = () => (pick("NEXT_PUBLIC_SITE_URL", "SITE_URL") || "https://www.seeingstarsagency.com").replace(/\/$/, "");

// The public URL + key the browser needs, handed to client components as a prop.
export const browserConfig = () => ({ url: SUPABASE_URL() || "", key: SUPABASE_PUBLIC_KEY() || "" });
