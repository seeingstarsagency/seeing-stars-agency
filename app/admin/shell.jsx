// Admin pages are only for Seeing Stars Agency, in English.
import { redirect } from "next/navigation";
import { getViewer } from "../../lib/supabase";
import { StarIcon } from "../ui";

export async function requireAdminPage() {
  const v = await getViewer();
  if (!v.user) redirect("/login");
  if (v.profile?.role !== "admin") redirect("/dashboard");
  return v;
}

export function AdminShell({ children }) {
  return (
    <div className="app">
      <header className="apphead apphead--dark">
        <div className="apphead__inner">
          <a href="/admin" className="apphead__logo">
            <StarIcon size={28} />
            <span className="disp"><span className="it">Seeing Stars</span> Agency</span>
            <span className="badge">Admin</span>
          </a>
          <div className="apphead__right">
            <a href="/admin">Artists</a>
            <a href="/admin/artists/new">+ New artist</a>
            <a href="/questionnaire" target="_blank" rel="noopener noreferrer">Find your package ↗</a>
            <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
            <form action="/auth/logout" method="post"><button type="submit" className="linkbtn">Log out</button></form>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

export const OK_MSG = {
  created: "Artist created. No invitation was sent.",
  invited: "Done: we emailed the artist a link to create their password.",
  invite_failed: "The artist was created, but the invitation failed (does that email already have an account?). You can resend it below.",
  saved: "Changes saved.",
  uploaded: "File uploaded.",
};
