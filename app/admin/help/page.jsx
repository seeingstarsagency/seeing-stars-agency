import { AdminShell, requireAdminPage } from "../shell";
import { setHelpStatus, replyHelp } from "../actions";

export const metadata = { title: "Help messages | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

// One chat per artist. Artists write from the "Help" button on their dashboard; you answer here
// and they read the answer in the same chat on the website.
export default async function HelpInbox({ searchParams }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [{ data: msgs }, { data: artists }] = await Promise.all([
    supabase.from("help_messages").select("*").order("created_at").limit(2000),
    supabase.from("artists").select("id, name"),
  ]);
  const nameOf = Object.fromEntries((artists || []).map((a) => [a.id, a.name]));
  const byArtist = {};
  (msgs || []).forEach((m) => (byArtist[m.artist_id] ||= []).push(m));
  const threads = Object.entries(byArtist).map(([artistId, list]) => ({
    artistId,
    list,
    last: list[list.length - 1],
    open: list.some((m) => m.sender === "artist" && m.status === "open"),
  })).sort((a, b) => (b.open - a.open) || b.last.created_at.localeCompare(a.last.created_at));
  const when = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
  const openCount = threads.filter((t) => t.open).length;

  return (
    <AdminShell>
      <a href="/admin">← Back to your artists</a>
      {sp?.ok === "sent" && <div className="alert alert--ok" role="status">Reply sent. The artist will see it in their Help chat.</div>}
      <div>
        <div className="kicker">from the Help button</div>
        <h1 className="h1">Help messages</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, maxWidth: 760 }}>
          One chat per artist. Answer here and they&apos;ll read it in the same chat on their dashboard (the Help button shows a number when there&apos;s a new reply).
          {openCount > 0 ? <> <strong>{openCount} waiting for an answer.</strong></> : " Nothing waiting. ✦"}
        </p>
      </div>

      {threads.length === 0 ? (
        <section className="panel"><p style={{ margin: 0 }}>No messages yet.</p></section>
      ) : threads.map((th) => (
        <section key={th.artistId} id={`t-${th.artistId}`} className={`panel helpthread${th.open ? " is-open" : ""}`}>
          <div className="helpthread__head">
            <a href={`/admin/artists/${th.artistId}`} className="h3" style={{ margin: 0 }}>{nameOf[th.artistId] || "Artist"}</a>
            {th.open ? <span className="helpmsg__topic" style={{ background: "#F4A6C9" }}>Waiting for you</span> : <span className="helpmsg__topic">Answered</span>}
          </div>
          <div className="chat chat--admin">
            {th.list.slice(-30).map((m) => (
              <div key={m.id} className={`chat__msg chat__msg--${m.sender === "agency" ? "me" : "them"}`}>
                <div className="chat__bubble">{m.body}</div>
                <div className="chat__meta">
                  {m.sender === "agency" ? "You" : nameOf[th.artistId] || "Artist"} · {when(m.created_at)}
                  {m.sender === "agency" && (m.seen_by_artist ? " · seen" : " · not seen yet")}
                </div>
              </div>
            ))}
          </div>
          <form action={replyHelp} className="chat__form">
            <input type="hidden" name="artist_id" value={th.artistId} />
            <textarea name="body" className="input" rows={3} maxLength={4000} required placeholder={`Reply to ${nameOf[th.artistId] || "the artist"}…`} aria-label="Reply" />
            <div className="inline">
              <button type="submit" className="btn btn--dark btn--sm">Send reply</button>
              {th.open && (
                <button type="submit" formAction={setHelpStatus} formNoValidate name="status" value="resolved" className="small-btn">✓ Mark as solved without replying</button>
              )}
            </div>
          </form>
        </section>
      ))}
    </AdminShell>
  );
}
