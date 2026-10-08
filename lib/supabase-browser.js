"use client";

import { createBrowserClient } from "@supabase/ssr";

// cfg = { url, key } passed down from a server component (see lib/env.js browserConfig).
export function supabaseBrowser(cfg) {
  return createBrowserClient(cfg.url, cfg.key);
}
