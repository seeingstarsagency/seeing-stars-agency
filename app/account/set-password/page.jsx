import { redirect } from "next/navigation";
import { getLang } from "../../../lib/i18n";
import { getViewer } from "../../../lib/supabase";
import SetPasswordForm from "./Form";
import { browserConfig } from "../../../lib/env";

export const dynamic = "force-dynamic";

// Where the invitation (and password reset) link lands: the email is already known,
// the artist only chooses a password, then goes on to the questionnaire / dashboard.
export default async function SetPassword() {
  const { user, profile, supabase } = await getViewer();
  if (!user) redirect("/login?error=link");

  let name = user.user_metadata?.artist_name || null;
  let artistLang = user.user_metadata?.lang;
  if (profile?.artist_id) {
    const { data: artist } = await supabase.from("artists").select("name, lang").eq("id", profile.artist_id).maybeSingle();
    name = artist?.name || name;
    artistLang = artist?.lang || artistLang;
  }
  const lang = await getLang(artistLang);
  return <SetPasswordForm lang={lang} sb={browserConfig()} email={user.email} name={name} />;
}
