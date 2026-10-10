import { PACKAGES } from "../../lib/steps";

// Fields shared by "create artist" (from a questionnaire or by hand).
export function NewArtistFields({ defaults = {} }) {
  const wanted = defaults.packages || [];
  return (
    <>
      <div className="fgrid">
        <div className="field"><label htmlFor="na-name">Artist name *</label><input id="na-name" name="name" className="input" required defaultValue={defaults.name} /></div>
        <div className="field"><label htmlFor="na-email">Email <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input id="na-email" name="email" type="email" className="input" defaultValue={defaults.email} /></div>
        <div className="field"><label htmlFor="na-legal">Legal name</label><input id="na-legal" name="legal_name" className="input" defaultValue={defaults.legal_name} /></div>
        <div className="field">
          <label htmlFor="na-lang">Artist's language</label>
          <select id="na-lang" name="lang" className="input" defaultValue={defaults.lang || "es"}>
            <option value="es">Spanish</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="field"><label htmlFor="na-single">Single</label><input id="na-single" name="single_title" className="input" defaultValue={defaults.single_title} /></div>
        <div className="field"><label htmlFor="na-date">Release date</label><input id="na-date" name="release_date" type="date" className="input" defaultValue={defaults.release_date} /></div>
      </div>
      <div className="field">
        <fieldset>
          <legend>Packages purchased</legend>
          <div className="opts">
            {PACKAGES.map((p) => (
              <label key={p} className="opt"><input type="checkbox" name="packages" value={p} defaultChecked={wanted.includes(p)} /> {p}</label>
            ))}
          </div>
        </fieldset>
      </div>
      <label className="opt" style={{ alignSelf: "flex-start" }}>
        <input type="checkbox" name="send_invite" defaultChecked /> Email an invitation so they can create their password (only if you added an email)
      </label>
    </>
  );
}
