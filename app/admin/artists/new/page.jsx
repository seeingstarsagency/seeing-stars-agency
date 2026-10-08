import { AdminShell, requireAdminPage } from "../../shell";
import { NewArtistFields } from "../../artist-form";
import { createArtist } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewArtist({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  return (
    <AdminShell>
      <a href="/admin">← Volver</a>
      <div>
        <div className="kicker">sin cuestionario</div>
        <h1 className="h1">Nuevo artista</h1>
        <p className="lead">Todos los pasos empezarán como pendientes. Si el artista ya tenía algo, márcalo como "Ya lo tenías" en su ficha.</p>
      </div>
      {sp?.error && <div className="alert">Falta el nombre o el correo.</div>}
      <form action={createArtist} className="panel panel--yellow stack" style={{ gap: 16 }}>
        <NewArtistFields />
        <button type="submit" className="btn btn--dark" style={{ alignSelf: "flex-start" }}>Crear artista</button>
      </form>
    </AdminShell>
  );
}
