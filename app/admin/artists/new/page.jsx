import PendingSubmit from "../../PendingSubmit";
import { AdminShell, requireAdminPage } from "../../shell";
import { NewArtistFields } from "../../artist-form";
import { createArtist } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewArtist({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  return (
    <AdminShell>
      <a href="/admin">← Back</a>
      <div>
        <div className="kicker">without questionnaire</div>
        <h1 className="h1">New artist</h1>
        <p className="lead">All steps will start as pending. If the artist already had something, mark it as "Already had" on their page.</p>
      </div>
      {sp?.error && <div className="alert">Name or email is missing.</div>}
      <form action={createArtist} className="panel panel--yellow stack" style={{ gap: 16 }}>
        <NewArtistFields />
        <PendingSubmit className="btn btn--dark" style={{ alignSelf: "flex-start" }} pendingText="Creating…">Create artist</PendingSubmit>
      </form>
    </AdminShell>
  );
}
