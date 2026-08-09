# Royal Migration Station — CRM Demo

A working demo covering all 4 core modules from the client brief (AI sales automation excluded — Phase 2):

1. **HR Management** — employee profiles, leave requests + approval flow, RBAC-scoped views
2. **Payment & Invoice Management** — invoice creation with auto VAT (5%), recurring flag, status tracking, financial summary
3. **Internal Calling & Messaging** — internal messaging log, call logging tied to customer cases
4. **Sales / Case Pipeline** — general-purpose case/lead management with a configurable pipeline (Inquiry -> Consultation -> Proposal -> In Progress -> Completed / On Hold / Rejected)

**Stack:** Next.js 15 (App Router) - TypeScript - Tailwind CSS - Prisma - PostgreSQL (Neon) - NextAuth.js

## RBAC model

Two roles, enforced at the query layer (not just UI hiding):

- **ADMIN** — sees all records across every module (all cases, all invoices, all employees, all messages)
- **USER** — sees only records they own (their own cases, invoices they created, their own leave requests, messages they sent/received)

See `src/lib/rbac.ts` — the `scopeToOwner()` helper is applied to every Prisma query across the app.

## Setup

### 1. Create a free Postgres database

Go to neon.tech (or use Vercel Postgres, which is Neon-based), create a project, and copy the connection strings.

### 2. Configure environment

```
cp .env.example .env
# paste your DATABASE_URL and DIRECT_URL from Neon
# generate AUTH_SECRET with: openssl rand -base64 32
```

### 3. Install & set up database

```
npm install
npx prisma db push      # creates all tables from prisma/schema.prisma
npm run db:seed         # populates demo data
```

### 4. Run locally

```
npm run dev
```

Open http://localhost:3000

### Demo logins (after seeding)

| Role  | Email                          | Password      |
|-------|---------------------------------|---------------|
| Admin | admin@royalmigration.com        | password123   |
| Admin | admin2@royalmigration.com       | password123   |
| User  | fatima@royalmigration.com       | password123   |
| User  | ahmed@royalmigration.com        | password123   |
| User  | layla@royalmigration.com        | password123   |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in vercel.com
3. Add environment variables (DATABASE_URL, DIRECT_URL, AUTH_SECRET) in Vercel project settings
4. Deploy — Vercel runs npm install -> prisma generate (postinstall) -> next build automatically
5. After first deploy, run `npx prisma db push` and `npm run db:seed` once, pointing at the same DATABASE_URL (from your local machine, using the production connection string) to set up and populate the production database

## What's demo-scope vs production-scope

This covers ~80% of the brief's functional surface with real, working CRUD — not a static mockup. Left as follow-on work for a production build:

- Real-time messaging (currently a message log, refreshes on page load)
- Actual VoIP calling (currently call logging, not live calling — confirm with client whether real calling is needed)
- Document upload storage (schema supports it; file upload UI not wired up in this demo)
- Email/SMS invoice reminders (schema supports reminder records; automated sending not wired up)
- Password reset / user invite flow
- AI sales automation (explicitly deferred to Phase 2 per client agreement)
