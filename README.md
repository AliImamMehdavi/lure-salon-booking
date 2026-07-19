# Zenith — Multi-Tenant Salon Booking Platform

A real multi-tenant SaaS: any number of salons can sign up, each gets
their own branded booking site and fully isolated admin back office.
Custom code throughout — no page builder, no theme system, no external
booking API required for core functionality.

## Architecture at a glance

- **Database:** PostgreSQL (via the standard `pg` driver — works with any
  Postgres host: Neon, Supabase, RDS, or self-hosted). One database,
  every tenant-owned table carries a `salon_id` column.
- **Tenant isolation:** every admin API route resolves `salonId` from a
  cryptographically signed session cookie (HMAC-SHA256, Node's built-in
  `crypto`, no library) — never from a URL, query param, or form field.
  Every database query then filters explicitly by that verified ID. This
  is what actually prevents one salon from ever seeing another's data,
  not just a `salon_id` column existing.
- **Routing:** guest-facing pages live under `/s/[slug]/...` (public,
  slug resolves the salon from the URL). Admin pages live under `/admin/*`
  with no slug in the URL at all — which salon you're managing is
  determined entirely by your signed-in session, so the URL can't be used
  to try to view another salon's back office.
- **Auth:** salon owners sign up with email + password (bcrypt-hashed).
  Guests don't need accounts — they book with name/phone (or email) and
  can look up existing bookings by name+phone or by booking reference.

## Run it locally

1. Get a Postgres database (a local one, or a free Neon project — see
   deploy-guide.txt).
2. Copy `.env.example` to `.env.local`, set `DATABASE_URL` and
   `SESSION_SECRET`.
3.
       npm install
       npm run dev
4. Visit `/signup` to create your first salon.

The database schema creates itself on first use — no separate migration
command to run.

## Guest-facing features

- Browse services by category, book solo or as a group (2–6 guests)
- Real month calendar, time slots grouped by morning/afternoon/evening
- Add-ons per service, including required ones set by the salon
- "Any available," a gender preference, or a specific stylist
- Multi-location: if a salon has more than one location, guests see a
  location step automatically; single-location salons never see it
- Look up bookings by name+phone or by booking reference, cancel or rebook
- Confirmation email (to the salon) and text (to the guest) on every booking

## Admin back office (`/admin`)

- **Dashboard** — today's bookings, totals, upcoming list
- **Schedule** — staff × time grid for any day
- **Bookings** — full list, filter by location, cancel any booking
- **Staff** — add/remove stylists, assign to a location, set working days
- **Services** — the actual service menu guests see and book — add
  services, categories, pricing, and add-ons (including marking one
  required, e.g. a patch test)
- **Locations** — add/edit/remove salon locations
- **Clients** — automatic client directory built from booking history
- **Marketing** — email/SMS campaigns to all clients, lapsed clients, or
  clients of a specific location

## Environment variables

See `.env.example`. `DATABASE_URL` and `SESSION_SECRET` are required;
everything else is optional and the app runs fine without it (emails/SMS
just log instead of sending).

## Project structure

- `lib/db/schema.sql` — the entire database schema
- `lib/db/pool.ts` — Postgres connection pool (works with any Postgres URL)
- `lib/db/salons.ts` — tenant signup/login/lookup
- `lib/db/{locations,services,staff,bookings}.ts` — tenant-scoped data
  access; every function takes `salonId` explicitly and every query
  filters by it
- `lib/tenant-auth.ts` — signed session cookies; `requireSalonId()` is
  what every admin route calls first
- `lib/availability.ts` — computes real open slots from staff working
  hours, days off, and existing bookings
- `lib/crm.ts` — client directory as a single SQL aggregate query
- `lib/booking-store.ts` — the guest booking flow's state machine (Zustand)
- `app/api/t/[slug]/*` — public, guest-facing, tenant-scoped API routes
- `app/api/admin/*` — session-protected admin API routes
- `app/s/[slug]/*` — guest-facing pages for a specific salon
- `app/admin/*` — admin back-office pages
- `proxy.ts` — redirects signed-out visitors away from `/admin/*`

## Known limitations (by design)

- One admin account per salon (no per-salon role/permission system yet)
- No online payment collection
- Guest lookup is name+phone or booking reference — not a full guest
  account system with passwords
- No self-serve billing/subscription for salons yet (this is the
  platform's own monetization layer, separate from the booking product
  itself)

## Deploying

See `deploy-guide.txt` for full step-by-step instructions, including
setting up a free Postgres database.
