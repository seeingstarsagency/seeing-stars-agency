"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";

// Finishes sign-in for email links that carry the session in the "#fragment".
export default function Callback({ sb }) {
  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search);
      let next = query.get("next") || "/auth/redirect";
      if (!next.startsWith("/") || next.startsWith("//")) next = "/auth/redirect";

      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (!access_token || !refresh_token) return window.location.replace("/login?error=link");

      const { error } = await supabaseBrowser(sb).auth.setSession({ access_token, refresh_token });
      window.location.replace(error ? "/login?error=link" : next);
    })();
  }, [sb]);

  return (
    <div className="app app--lined" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24, minHeight: "100vh" }}>
      <p className="lead">✶ …</p>
    </div>
  );
}
