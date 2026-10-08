# Md Bakhtiar Fahim — Portfolio + Admin CMS

A personal portfolio with a built-in admin panel. A single Next.js app is both the frontend and the backend: pages, route handlers and server actions, with MongoDB for storage. Every piece of content, including uploads and the resume PDF, can be edited at `/admin` without touching code.

- **Public site:** hero with a live system map, proof bar, Sylvia HRMS case study with an interactive architecture diagram, scroll-drawn experience timeline, projects with case-study drawers, skills grid ("where I used it"), live Codeforces stats, about, contact form, and `/resume`.
- **Extras:** Recruiter Mode (`⚡ 30-sec view`), command palette (⌘K / Ctrl+K), terminal easter egg (`>_` in the footer, try `sudo hire fahim`), light/dark theme, availability badge, contact prefill from "Discuss this", and a greeting based on the visitor's local time.
- **Admin:** dashboard, every content type editable, drag-to-reorder, publish toggles, rich text, image and PDF uploads, resume version history, messages inbox, section ordering, and SEO.

---

## Quick start

Requirements: Node.js 20.9+ and a MongoDB database (Atlas, or local Docker).

```bash
npm install
cp .env.example .env.local      # then fill in the three values
npm run seed                    # loads all content from lib/seed-data.ts
npm run dev                     # http://localhost:3000  ·  admin: /admin
```

A local database in one command, if you have Docker:

```bash
docker run -d --name portfolio-mongo -p 27017:27017 mongo:8
# MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
```

## Environment variables

Only three are required. `lib/env.ts` checks them with Zod when the server starts and fails with a clear message if one is missing or if the password is shorter than 12 characters.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin password, 12+ characters. Also used to derive the session signing key |
| `RESEND_API_KEY` | optional | Emails you about new contact messages (via Resend) |
| `CONTACT_TO_EMAIL` | optional | Where those emails go. Both Resend variables must be set, otherwise sending is skipped silently |
| `CONTACT_FROM_EMAIL` | optional | Sender, e.g. `Portfolio <hello@your-domain.com>`. Defaults to Resend's onboarding sender |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical URL for SEO. On Vercel the production URL is detected automatically |

`.env.local` is git-ignored. No secret uses the `NEXT_PUBLIC_` prefix.

## Seeding

```bash
npm run seed
```

The seed is idempotent: run it as often as you like. It **reloads all text content** from `lib/seed-data.ts`, which holds the resume facts. It also:

- keeps uploaded files and the references to them (profile photo, project covers and galleries, mockups, OG image);
- never touches the **Messages** inbox;
- creates a placeholder resume PDF only if no resume exists yet.

Re-seeding overwrites edits you made in the admin, so after launch, edit content in `/admin` instead. If the public site still shows old content after a reseed, open **Admin → Settings → Refresh public site cache**.

If the database is unreachable, for example during a build without network access, the site renders the built-in seed content and checks the database again every minute.

## Admin

- Go to `/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Sessions last 7 days and are stored in an httpOnly, Secure, SameSite=Lax cookie holding a JWT.
- Saving anything updates the public site immediately (`updateTag`), while pages stay statically prerendered.

### Changing the admin password

There is no change-password page, by design. To change the password:

1. Set a new `ADMIN_PASSWORD` (12+ characters) in `.env.local`, or in Vercel → Settings → Environment Variables.
2. Restart the dev server, or redeploy on Vercel.

The session signing key is `SHA-256(ADMIN_EMAIL:ADMIN_PASSWORD:salt)`, so changing either value **signs out every existing session** automatically.

### Placeholders to replace after the first deploy

The seed uses `REPLACE_ME` placeholders. Fill them in from the admin:

- **Social Links:** GitHub, LinkedIn, CodeChef and Codeforces URLs.
- **Projects:** Live, client repo and server repo URLs, plus cover images.
- **Competitive Prog.:** your Codeforces handle (stats are then fetched live every 12h) and your CodeChef values. A card stays hidden until it has data.
- **Resume:** upload the real PDF. It becomes active immediately and `/resume` and `/resume.pdf` serve it.
- **Profile & Hero:** your photo.

## Deploying to Vercel + MongoDB Atlas

1. **Create the database.** In MongoDB Atlas, create a free cluster and a database user.
2. **Allow network access.** Go to Atlas → Security → **Network Access** → *Add IP Address* → **Allow access from anywhere (`0.0.0.0/0`)**. Vercel functions and builds don't use fixed IP addresses, so this is required. The database user's password still protects the data, so use a strong one.
3. **Get the connection string.** Copy it from Atlas → *Connect* → *Drivers*, and add the database name: `mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/portfolio?retryWrites=true&w=majority`.
4. **Seed from your machine.** Put that URI in `.env.local` and run `npm run seed`.
5. **Import into Vercel.** Import the repo, then add `MONGODB_URI`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, plus the optional variables if you want them. Deploy.
6. **Update content.** Visit `/admin` on the deployed URL and fill in the placeholders.

The build reads content from MongoDB to prerender the home page, so Atlas must allow the build to connect (step 2). Vercel Analytics turns on automatically on Vercel deployments and tracks resume, contact and project-link clicks.

> **Upload size on Vercel:** Vercel limits request bodies to about 4.5 MB. The app accepts resume PDFs up to 5 MB, but on Vercel keep PDFs under ~4.4 MB. Images are capped at 4 MB.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Make a production build / serve it |
| `npm run seed` | Load or reload content from `lib/seed-data.ts` |
| `npm run lint` · `npm run typecheck` · `npm run format` | ESLint · TypeScript · Prettier |
| `npm run test:e2e` | Playwright smoke tests. Starts `npm run dev` unless something is already running on :3000 |

The e2e tests read `.env.local`. They sign in to the admin, edit one stat and restore it, and clear login rate limits before and after the run. Install the browser once with `npx playwright install chromium`.

## How it's built

**Stack:** Next.js 16.4 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Radix primitives in the shadcn/ui style · lucide-react · Motion · Lenis · MongoDB with Mongoose 9 · Zod 4 · react-hook-form · Tiptap · jose · dnd-kit · cmdk · sonner · Playwright.

```
app/
  (site)/page.tsx            public one-pager (sections render in the order set in admin)
  (site)/resume/page.tsx     embedded PDF viewer with a Download button
  resume.pdf/route.ts        stable link that redirects to the active resume
  api/files/[id]/route.ts    serves uploads (Content-Type, ETag, immutable caching)
  api/admin/upload/route.ts  image and PDF uploads (session + same-origin + magic bytes)
  admin/                     login, auth actions, content actions, (panel)/* pages
  og/route.tsx               generated Open Graph image (name + headline)
  icons.svg/route.ts         brand-icon sprite (keeps long SVG paths out of the HTML)
  sitemap.ts, robots.ts
components/
  sections/                  public sections
  site/                      navbar, system map, architecture diagram, palette, terminal…
  motion/                    reveal, count-up, spotlight, magnetic, tilt, typing
  admin/                     shell, collection manager, form system, resume and inbox
  ui/                        button, input, dialog, popover, switch, badge…
lib/
  env.ts, db.ts              env validation and a cached Mongoose connection
  models/                    one Mongoose model per file
  validators/                Zod schemas shared by forms and server actions
  auth/                      token.ts (jose, also used by the proxy) and session.ts
  content.ts                 one cached read of all public content ('use cache' + tag)
  admin-data.ts              uncached, session-checked reads for the admin
  rate-limit.ts              Mongo-backed fixed-window limiter (TTL index)
proxy.ts                     guards /admin/* and /api/admin/* (Next 16's name for middleware)
scripts/seed.ts              idempotent seed
```

**Caching:** every public read goes through `getSiteContent()`, which uses `'use cache'` with `cacheTag('site-content')`. `/` and `/resume` are prerendered static pages. Every admin save calls `updateTag('site-content')`, so the next visitor sees the change. Codeforces stats are cached for 12 hours.

**Security:**

- **Auth:** `proxy.ts` blocks signed-out requests to `/admin/*` and `/api/admin/*`, and every admin page, server action and route handler verifies the session again on its own.
- **Login:** credentials are compared with `crypto.timingSafeEqual` (over SHA-256 digests). Login allows 5 failed attempts per 15 minutes per IP, with a generic "Invalid credentials" error.
- **Contact form:** limited to 5 messages per hour per IP, with a honeypot field and Zod validation.
- **Input handling:** keys starting with `$` (and dotted keys) are rejected; ObjectIds are validated with a strict regex; rich text is sanitized server-side with `sanitize-html`.
- **Uploads:** checked by magic bytes (`%PDF-`, PNG, JPEG, WebP, GIF, AVIF; SVG is refused) and by size, and must come from the same origin.
- **Headers:** CSP, `X-Frame-Options: SAMEORIGIN` (so `/resume` can embed the PDF), `Referrer-Policy`, HSTS, and `noindex` on admin pages and API routes.

**Confidentiality:** the case study names no clients and uses no product screenshots. It shows an original architecture diagram and an abstract mockup with generic data, labelled as such.

## Decisions and defaults

The brief left these open, or Next.js 16 required them:

- **Next.js 16, not 15.** The project was scaffolded on Next 16.4, so it uses that version's conventions: `proxy.ts` instead of `middleware.ts`, Cache Components, `updateTag`, and async request APIs.
- **MongoDB stack.** Per the stack override: MongoDB + Mongoose with files stored in MongoDB, no Auth.js, no Cloudinary and no Redis.
- **Resend without its SDK.** Contact emails go through Resend's REST API, so there is no extra dependency.
- **Section headings** ("Shipping in production, moving up the stack." and so on) are fixed in code. The teaser lines between sections are editable in **Sections & Order**.
- **Headline highlight.** Wrap words in `*asterisks*` to show them in the accent gradient.
- **Skill icons** use [simple-icons](https://simpleicons.org) slugs. Unknown slugs, and brands simple-icons no longer ships (e.g. C#, gRPC), render as a monogram tile. "Where I used it" matches a skill's name and aliases against the tech tags on experience and projects.
- **No `@react-three/fiber`.** The 3D hero was optional. The system map is plain SVG and HTML, which is lighter and works everywhere.
- **Smooth scrolling (Lenis)** loads only for mouse and trackpad users. Touch devices keep native scrolling.
- **Brief-only items.** The project "challenges" bullets in the seed come from each project's tech stack rather than from the resume, so review them in the admin.

## Performance and accessibility

Measured locally with Lighthouse (mobile) against `next start`:

- **Accessibility, Best Practices, SEO:** 100.
- **Performance:** about 70. On the same machine, a page with nothing but a login form scores about 82, so this environment's CPU emulation sets a low ceiling. Check the real score with PageSpeed Insights on the Vercel deployment.

Work already done for performance:

- Brand icons are served from a cached sprite.
- The command palette, terminal, contact form and Lenis load on demand.
- Sections hydrate in separate Suspense boundaries.
- There are no layout animations, and the status dot animates on the compositor.

Every animation respects `prefers-reduced-motion`. Pages are fully keyboard-navigable, with visible focus rings, semantic landmarks and a skip link.
