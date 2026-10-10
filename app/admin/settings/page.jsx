import { AdminShell, requireAdminPage } from "../shell";
import { supabaseAdmin } from "../../../lib/supabase";
import { browserConfig } from "../../../lib/env";
import { saveSettings } from "../actions";
import AgreementUpload from "./AgreementUpload";

export const dynamic = "force-dynamic";

export default async function Settings({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { data, error } = await supabaseAdmin().from("agency_settings").select("key, value");
  const get = (k) => (data || []).find((r) => r.key === k)?.value || "";

  return (
    <AdminShell>
      <a href="/admin">← Back</a>
      <div>
        <div className="kicker">only you see this</div>
        <h1 className="h1">Settings</h1>
        <p className="lead">Used when you send a Launchpad quote to an artist.</p>
      </div>
      {error && <div className="alert">The settings table doesn&apos;t exist yet. Run the latest part of supabase/schema.sql in Supabase (SQL Editor).</div>}
      {sp?.ok === "saved" && <div className="alert alert--ok" role="status">Settings saved.</div>}

      <section className="panel panel--pink stack" style={{ gap: 18 }}>
        <div>
          <h2 className="h2">Service Agreement</h2>
          <p style={{ margin: 0, fontSize: 15 }}>The PDF attached to every quote email and linked on the quote page. Each artist gets the one in their language. Uploading a new file replaces it for quotes sent from now on.</p>
        </div>
        <div className="fgrid">
          <AgreementUpload lang="en" label="English PDF" current={get("agreement_en")} sb={browserConfig()} />
          <AgreementUpload lang="es" label="Spanish PDF" current={get("agreement_es")} sb={browserConfig()} />
        </div>
      </section>

      <form action={saveSettings} className="panel panel--yellow stack" style={{ gap: 16 }}>
        <div>
          <h2 className="h2">How to pay</h2>
          <p style={{ margin: 0, fontSize: 15 }}>Shown to the artist right after they accept their quote, and in their confirmation email. Write it the way they should read it, e.g. Zelle phone or email, bank name, account and routing numbers.</p>
        </div>
        <div className="fgrid">
          <div className="field">
            <label htmlFor="payment_en">English</label>
            <textarea id="payment_en" name="payment_en" className="input" style={{ minHeight: 140 }} defaultValue={get("payment_en")} placeholder={"Zelle: …\nBank transfer (Bank of America)\nAccount: …\nRouting: …"} />
          </div>
          <div className="field">
            <label htmlFor="payment_es">Spanish</label>
            <textarea id="payment_es" name="payment_es" className="input" style={{ minHeight: 140 }} defaultValue={get("payment_es")} placeholder={"Zelle: …\nTransferencia (Bank of America)\nCuenta: …\nRuta (routing): …"} />
          </div>
        </div>
        <button type="submit" className="btn btn--dark btn--sm" style={{ alignSelf: "flex-start" }}>Save</button>
      </form>
    </AdminShell>
  );
}
