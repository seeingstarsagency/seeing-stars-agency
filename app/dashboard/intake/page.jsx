import { redirect } from "next/navigation";
import { getViewer } from "../../../lib/supabase";
import { getLang, T } from "../../../lib/i18n";
import { SECTIONS } from "../../../lib/questions";
import { AppHeader, LogoutButton } from "../../ui";
import { FormSections } from "../../form-fields";
import { saveIntake } from "./actions";

export const metadata = { title: "Questionnaire | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

// The Launchpad intake, shown to an artist the first time they open their dashboard.
export default async function Intake({ searchParams }) {
  const { user, profile, supabase } = await getViewer();
  if (!user) redirect("/login");
  if (profile?.role === "admin") redirect("/admin");
  if (!profile?.artist_id) redirect("/dashboard");

  const { data: artist } = await supabase.from("artists").select("*").eq("id", profile.artist_id).maybeSingle();
  if (!artist) redirect("/dashboard");
  if (artist.intake_done_at) redirect("/dashboard");

  const lang = await getLang(artist.lang);
  const t = T[lang];
  const sp = await searchParams;
  const values = {
    legal_name: artist.legal_name,
    artist_name: artist.name,
    single_title: artist.single_title,
    next_release: artist.release_date,
  };

  return (
    <div className="app app--lined">
      <AppHeader lang={lang} path="/dashboard/intake" dark right={<><span>{artist.name}</span><LogoutButton lang={lang} /></>} />
      <main className="container narrow" style={{ gap: 24 }}>
        <div>
          <div className="kicker">{t.iKicker}</div>
          <h1 className="h1">{t.iTitle}</h1>
          <p className="lead">{t.iLead}</p>
        </div>
        {sp?.error && <div className="alert" role="alert">{sp.error === "required" ? t.iRequired : t.qError}</div>}
        <form action={saveIntake} className="stack" style={{ gap: 28 }}>
          <FormSections sections={SECTIONS} lang={lang} values={values} />
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{t.iFoot}</p>
          <div>
            <button type="submit" className="btn btn--accent">{t.iSend}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
