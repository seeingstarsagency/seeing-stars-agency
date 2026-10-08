import { PACKAGES } from "../../lib/steps";

// Fields shared by "create artist" (from a questionnaire or by hand).
export function NewArtistFields({ defaults = {} }) {
  const wanted = defaults.packages || [];
  return (
    <>
      <div className="fgrid">
        <div className="field"><label htmlFor="na-name">Nombre artístico *</label><input id="na-name" name="name" className="input" required defaultValue={defaults.name} /></div>
        <div className="field"><label htmlFor="na-email">Correo *</label><input id="na-email" name="email" type="email" className="input" required defaultValue={defaults.email} /></div>
        <div className="field"><label htmlFor="na-legal">Nombre legal</label><input id="na-legal" name="legal_name" className="input" defaultValue={defaults.legal_name} /></div>
        <div className="field">
          <label htmlFor="na-lang">Idioma del artista</label>
          <select id="na-lang" name="lang" className="input" defaultValue={defaults.lang || "es"}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="field"><label htmlFor="na-single">Sencillo</label><input id="na-single" name="single_title" className="input" defaultValue={defaults.single_title} /></div>
        <div className="field"><label htmlFor="na-date">Fecha de lanzamiento</label><input id="na-date" name="release_date" type="date" className="input" defaultValue={defaults.release_date} /></div>
      </div>
      <div className="field">
        <fieldset>
          <legend>Paquetes contratados</legend>
          <div className="opts">
            {PACKAGES.map((p) => (
              <label key={p} className="opt"><input type="checkbox" name="packages" value={p} defaultChecked={wanted.includes(p)} /> {p}</label>
            ))}
          </div>
        </fieldset>
      </div>
      <label className="opt" style={{ alignSelf: "flex-start" }}>
        <input type="checkbox" name="send_invite" defaultChecked /> Enviar invitación por correo para que cree su contraseña
      </label>
    </>
  );
}
