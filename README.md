# Seeing Stars Agency — seeingstarsagency.com

Website for Seeing Stars Agency, built with Next.js.

## Edit the text

All copy lives in `app/content.js` (packages, bundles, services, steps, contact info).
Styles are in `app/globals.css`. The page layout is `app/page.jsx`.

Before going live, fill in `CONTACT` in `app/content.js`:
- `email` (e.g. hello@seeingstarsagency.com)
- `instagramHandle` and `instagramUrl`

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Publish (GitHub + Vercel + Namecheap)

1. **GitHub:** create an empty repository (e.g. `seeing-stars-agency`) and push this folder to it.
2. **Vercel:** sign in at vercel.com with GitHub → *Add New → Project* → import the repository → *Deploy*.
   Vercel detects Next.js automatically. You get a temporary address like `seeing-stars-agency.vercel.app`.
3. **Domain in Vercel:** Project → *Settings → Domains* → add `seeingstarsagency.com` and `www.seeingstarsagency.com`.
   Vercel shows the DNS records to use.
4. **Namecheap:** Domain List → *Manage* next to seeingstarsagency.com → *Advanced DNS*.
   - Delete the default parking records (`CNAME www → parkingpage.namecheap.com` and the `URL Redirect` record).
   - Add an **A Record**: Host `@`, Value = the IP Vercel shows (currently `76.76.21.21`).
   - Add a **CNAME Record**: Host `www`, Value = the address Vercel shows (e.g. `cname.vercel-dns.com`).
   - Always copy the exact values Vercel displays; they take priority over the ones listed here.
5. Wait from a few minutes to a few hours. Vercel adds HTTPS automatically.

Every time you push a change to GitHub, Vercel republishes the site on its own.

## Questionnaire, artist dashboards and admin

- `/questionnaire` · bilingual intake form (answers become each artist's starting point)
- `/login` · artist and admin login
- `/dashboard` · artist progress: starting point vs today, steps, next steps, files, notes
- `/admin` · only for Seeing Stars Agency: questionnaires, artists, editing progress
- `/report` · closing report with what was done, what's pending and the recommended next package

The 15-step checklist lives in `lib/steps.js`; questionnaire questions in `lib/questions.js`; texts in `lib/i18n.js`.
One-time database setup: see `supabase/SETUP.md`.
