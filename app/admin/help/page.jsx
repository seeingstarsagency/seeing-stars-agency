import { AdminShell, requireAdminPage } from "../shell";
import { setHelpStatus } from "../actions";
import { fmtDate } from "../../ui";

export const metadata = { title: "Help messages | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const TOPIC = { question: "Question", problem: "Something isn't working", payment: "Payments", other: "Other" };

export default async function HelpInbox() {
  const { supabase } = await requireAdminPage();
  const [{ data: msgs }, { data: artists }] = await Promise.all([
    supabase.from("help_messages").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("artists").select("id, name"),
  ]);
  const nameOf = Object.fromEntries((artists || []).map((a) => [a.id, a.name]));
  const open = (msgs || []).filter((m) => m.status === "open");
  const done = (msgs || []).filter((m) => m.status === "resolved");

  const Item = ({ m }) => (
    <li className={`helpmsg${m.status === "resolved" ? " is-done" : ""}`}>
      <div className="helpmsg__top">
        <a href={`/admin/artists/${m.artist_id}`} className="helpmsg__who">{nameOf[m.artist_id] || "Artist"}</a>
        <span className="helpmsg__topic">{TOPIC[m.topic] || "Other"}</span>
        <span className="muted" style={{ fontSize: 13 }}>{fmtDate(m.created_at, "en")} · {new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })}</span>
      </div>
      <p className="helpmsg__body">{m.body}</p>
      <div className="inline">
        {m.email && (
          <a className="small-btn small-btn--dark" style={{ textDecoration: "none" }} href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Seeing Stars Agency")}&body=${encodeURIComponent(`\n\n---\nYou wrote:\n${m.body}`)}`}>
            Reply by email ({m.email})
          </a>
        )}
        <form action={setHelpStatus}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="status" value={m.status === "open" ? "resolved" : "open"} />
          <button type="submit" className="small-btn">{m.status === "open" ? "✓ Mark as solved" : "Reopen"}</button>
        </form>
      </div>
    </li>
  );

  return (
    <AdminShell>
      <a href="/admin">← Back to your artists</a>
      <div>
        <div className="kicker">from the Help button</div>
        <h1 className="h1">Help messages</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, maxWidth: 760 }}>
          Messages artists send from the &ldquo;Help&rdquo; button on their dashboard. Reply by email, then mark it as solved.
        </p>
      </div>
      <section className="panel panel--yellow">
        <h2 className="h2">Open ({open.length})</h2>
        {open.length === 0 ? <p style={{ margin: 0 }}>No open messages. ✦</p> : <ul className="helplist">{open.map((m) => <Item key={m.id} m={m} />)}</ul>}
      </section>
      {done.length > 0 && (
        <section className="panel">
          <h2 className="h2">Solved</h2>
          <ul className="helplist">{done.map((m) => <Item key={m.id} m={m} />)}</ul>
        </section>
      )}
    </AdminShell>
  );
}
