// Admin pages are only for Seeing Stars Agency, so they're in Spanish.
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
            <a href="/admin">Artistas</a>
            <a href="/admin/artists/new">+ Nuevo artista</a>
            <a href="/" target="_blank" rel="noopener noreferrer">Ver web</a>
            <form action="/auth/logout" method="post"><button type="submit" className="linkbtn">Salir</button></form>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

export const OK_MSG = {
  created: "Artista creado. No se envió invitación.",
  invited: "Listo: le enviamos al artista un correo para crear su contraseña.",
  invite_failed: "El artista se creó, pero la invitación falló (¿ese correo ya tiene cuenta?). Puedes reenviarla abajo.",
  saved: "Cambios guardados.",
  uploaded: "Archivo subido.",
};
