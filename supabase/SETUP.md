# Turning on the questionnaire, logins and dashboards

The code is ready. These one-time steps connect it to the database (Supabase).

## 1. Create the database tables
Supabase → your project → **SQL Editor** → **New query** → paste the whole content of `supabase/schema.sql` → **Run**.
It should say "Success. No rows returned".

## 2. Login settings
Supabase → **Authentication**:

- **URL Configuration**
  - Site URL: `https://www.seeingstarsagency.com`
  - Redirect URLs: add `https://www.seeingstarsagency.com/**`
- **Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
  Only you create accounts; invitations still work.
- **Emails → Templates**: nothing to change. The default emails work as they are.
  Editing their text requires your own email service (SMTP), see the bottom of this page.

## 3. Keys in Vercel
Vercel → project → **Settings → Environment Variables**. Add these four:

| Name | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API Keys / Connect → Project URL |
| `SUPABASE_ANON_KEY` | Publishable key (or legacy "anon") |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (or legacy "service_role") — **secret, paste only here** |
| `SITE_URL` | `https://www.seeingstarsagency.com` |

(The `NEXT_PUBLIC_…` versions of these names also work.)
Then **Deployments → ⋯ on the latest → Redeploy**, so the site picks up the keys.

## 4. Make yourself the admin
1. Supabase → **Authentication → Users → Add user → Create new user**: your email, a strong password, tick **Auto Confirm User**.
2. **SQL Editor → New query**, replace the email and run:
   ```sql
   insert into public.profiles (id, role)
   select id, 'admin' from auth.users where email = 'YOUR@EMAIL.COM'
   on conflict (id) do update set role = 'admin';
   ```
3. Go to `https://www.seeingstarsagency.com/login` and log in. You land on `/admin`.

## Spotify (optional: import songs from Spotify)
Apple Music works without setup. For Spotify:
1. https://developer.spotify.com/dashboard → Create app (the account must have Spotify Premium).
   Redirect URI: `https://www.seeingstarsagency.com` · tick "Web API".
2. In the app's Settings copy the Client ID and Client secret.
3. Vercel → Settings → Environment Variables: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` (secret: paste only here) → Redeploy.

## Daily use
- Artists fill in `/questionnaire` (EN/ES). It appears in **Admin → Cuestionarios nuevos**.
- Open it → **Crear artista**: creates their checklist from their answers and emails them an invitation.
- In the artist's page you update steps, next steps, notes, the timeline and files. The artist sees it live.
- **Informe final** builds the closing report; use "Download PDF" to save it.

## Custom emails (sender name and branded templates)
Supabase only lets you edit email text once you connect your own email service.
For now we use the Gmail account:
1. Gmail: turn on 2-Step Verification, then create an App Password at https://myaccount.google.com/apppasswords
2. Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
   host `smtp.gmail.com`, port `465`, username and sender `seeingstarsagency@gmail.com`,
   sender name `Seeing Stars Agency`, password = the App Password.
3. Supabase → Authentication → Emails → Templates: paste the files in `supabase/email-templates/`
   (Invite user, Magic link, Reset password).

## Email sending limits
Supabase's built-in email is fine for testing but sends only a few emails per hour.
Before inviting many artists, connect your own email service in Supabase → **Authentication → Emails → SMTP Settings**
(for example Resend, or the mailbox you create for hello@seeingstarsagency.com).
