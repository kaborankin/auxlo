# PAJO — Rotation Savings Pot (Susu / Ajo) Platform

> **Product 1 of Auxlo Systems.** A multi-tenant web application that digitises
> rotating community savings circles ("pajo" / susu / ajo / thrift), replacing
> the group-chat + spreadsheet workflow with an auditable dashboard.
>
> **Status:** `v0.1 — internal preview`. Data layer, rules engine, and all
> dashboard pages are live and tested against the real dev database. Auth is
> gated behind a read-only preview bypass until NextAuth sign-in is verified.
> The first real circle this will operate is a live **£50/week × 10 members ×
> 10 weeks** thrift already running manually.

---

## 1. What Pajo does today

One **Organization** (tenant) = one circle or an operator running several
circles. Each circle is a **Pot**: members contribute a fixed amount on a fixed
schedule, one member receives the full pot each period, and everyone keeps
contributing until the cycle ends. Pajo tracks every pound, enforces the group
rulebook mechanically, and gives every member full visibility ("no secrets").

### 1.1 Encoded group rulebook

The £50-weekly-thrift rules document is not just displayed — it is **enforced
in code** (`lib/pajo/rules.ts`):

| Rule | Implementation |
|---|---|
| £50/week, 10 members, one recipient/week | `Pot.contributionAmount`, `memberTarget`, `PotWeek.recipientId` |
| Friday 6 PM deadline | `Pot.dueDay` (0=Sun…6=Sat) + `Pot.dueTime` |
| 24h grace period | `computeGraceDeadline()` — live status derives `open → grace → late` from the clock between cron runs |
| 1st late → gentle reminder | `escalateLatePayment()` strike 1 |
| 2nd late → £5 fee into next pot | strike 2, `applyLateFee`, fee lands on next open week's contribution |
| 3rd late / no payment → forfeit payout turn | strike 3, `forfeitPayout` until arrears cleared |
| Leaving early → refund paid-in, lose turn | `leavePot()` |
| Replacement inherits leaver's paid-in | `replaceMember()` |
| Rules accepted before money moves | `acceptPotRules()` + `PotMember.rulesAcceptedAt` |
| Payout order by random / agreement / need | `PotPayoutMethod`: `RANDOM` \| `AGREED` \| `BY_NEED` |
| No secrets — public record | Every mutation writes an `AuditLog` entry (tamper-evident, org-scoped) |

### 1.2 Dashboard pages (all serving 200, live data)

| Route | Purpose | Key features |
|---|---|---|
| `/pajo` | Pot picker | Lists every pot the signed-in user (or preview session) can access |
| `/pajo/[potSlug]` | Overview | This week's collection vs £500 target, paid/pending/late breakdown, live week status, countdown, contributor table |
| `/pajo/[potSlug]/ledger` | Full history | Every contribution ever: due, paid, status pill, payer, reference — replaces the spreadsheet |
| `/pajo/[potSlug]/members` | Roster | Payout positions, strikes, totals contributed/received, status (active/left/replaced), rules-acceptance state |
| `/pajo/[potSlug]/payouts` | Cycle schedule | All 10 weeks, recipient per week, status (`upcoming/open/grace/late/closed/paid-out`), payout amounts |
| `/pajo/[potSlug]/rules` | Rulebook | Full rules text + each member's acceptance timestamp |
| `/pajo/[potSlug]/settings` | Admin | Pot configuration, bank details, member management (admin-only surface) |

Design system: dark `auxlo-*` palette (near-black surfaces, lime `#C8FF00`
accent, semantic success/warning/danger/info), shared shell components in
`components/pajo/` (`Sidebar`, `Topbar`, `StatCard`, `StatusPill`) and action
components (`ContributionActions`, `PayoutAction`) that render admin controls
only for authorised users.

### 1.3 API endpoints

All under `/api/pajo`, each re-checks access server-side (`lib/pajo/access.ts`)
and writes an audit entry:

| Method & path | Action | Who |
|---|---|---|
| `POST /api/pajo/pots` | Create pot + cycle 1 + all weeks + all member contributions in one transaction (30s timeout, batched inserts — sized for 10 members × 10 weeks = 100 rows) | Admin |
| `POST /api/pajo/contributions/[id]/pay` | Record a member's payment (amount, reference, paid-at) | Admin |
| `POST /api/pajo/contributions/[id]/escalate` | Apply the strike ladder to a late/missed payment | Admin |
| `POST /api/pajo/weeks/[id]/payout` | Mark week paid out → closes week, opens next | Admin |
| `POST /api/pajo/members/[id]/accept-rules` | Member e-signs the rulebook | Member (self) |

Auth endpoints: `app/api/auth/[...nextauth]/route.ts` (NextAuth: Google OAuth +
credentials, session carries role/memberships/isAdmin).

### 1.4 Data layer

`lib/pajo/` is the single import surface (`index.ts` re-exports everything;
pages import from `@/lib/pajo` and nowhere else):

- **`types.ts`** — view models (`PotOverview`, `MemberSummary`, `WeekSummary`,
  `LedgerEntry`, `ContributionRow`, `WeekLiveStatus`)
- **`rules.ts`** — `STRIKE_THRESHOLDS`, `computeGraceDeadline`,
  `computeWeekLiveStatus`, `escalateLatePayment`, `buildDefaultRulesText`
- **`queries.ts`** — `getPotOverview`, `getPotMembers`, `getPotSchedule`,
  `getPotLedger`, `getPotsForOrg`, `getPotBySlug`
- **`mutations.ts`** — `createPot`, `recordContributionPayment`,
  `applyLateEscalation`, `leavePot`, `replaceMember`, `acceptPotRules`,
  `markWeekPaidOut`
- **`access.ts`** — `getPajoAccess`, `getPajoPotsForUser`, `isPajoPreviewMode`


## 2. Data model

Tenant model reuses Auxlo's existing `Organization` / `UserProfile` /
`UserMembership` / `Role` / `InvitationToken` / `AuditLog`. Pajo adds six
models + five enums (`prisma/schema.prisma`, "PAJO" section):

```
Organization 1─┬─* Pot 1─┬─* PotMember *─1 UserProfile
               │         ├─* PotCycle 1─* PotWeek 1─* Contribution
               └─* AuditLog (public "no secrets" feed)
```

| Model | Purpose | Notable fields |
|---|---|---|
| `Pot` | The circle | `slug` (unique, URL key), `contributionAmount` (50), `currency` (gbp), `memberTarget` (10), `frequency` (weekly/biweekly/monthly), `dueDay`, `dueTime`, `graceHours` (24), `lateFeeAmount` (5), `payoutMethod`, `bankDetails` (JSON), `rulesText`, `status` |
| `PotMember` | Membership | `payoutPosition`, `strikes`, `totalContributed`, `totalReceived`, `status` (`ACTIVE/LEFT/REPLACED/REMOVED`), `rulesAcceptedAt`; unique per (pot, user) |
| `PotCycle` | One full run | `cycleNumber` (unique per pot), `startDate/endDate`, `status` (`ACTIVE/COMPLETED/CANCELLED`) |
| `PotWeek` | One period | `weekNumber` (unique per cycle), `dueDate`, `recipientId`, `status` (`UPCOMING/OPEN/CLOSED/PAID_OUT`), `payoutAmount`, `paidOutAt` |
| `Contribution` | One member × one week | `amountDue`, `amountPaid`, `status` (`PENDING/PAID/LATE/MISSED/FORFEITED/WAIVED`), `reference`, `paidAt`, `lateFeeApplied`, `notes`; unique per (week, member) |

All relations cascade-delete within the pot boundary. Schema applied to the dev
database via `prisma db push` (see §4.4 for the migration-drift caveat).

## 3. Access control

| Actor | Role | Can do |
|---|---|---|
| Org `ORG_ADMIN` / `ORG_MANAGER` | Pajo **admin/treasurer** | Everything: record payments, escalate, mark payouts, create/edit pots, replace members, settings |
| Invited `PotMember` | Pajo **member** | View all pages, accept rules, (roadmap: mark own payment as sent) |
| `ORG_VIEWER` | Viewer | Read-only visibility |
| Preview session (`PAJO_BYPASS_AUTH=true`) | Read-only ghost | View all pages; **no admin buttons, no API mutations** |

- `middleware.ts` requires a NextAuth token for `/pajo/*` **unless**
  `PAJO_BYPASS_AUTH === 'true'` (currently enabled for review — see roadmap
  Phase 0). Bypass is scoped to `/pajo` only; `/admin` etc. still enforce auth.
- Defence in depth: even with the middleware bypass, `access.ts` returns a
  null/preview access level server-side, and every API mutation route
  independently re-checks authorisation — the preview cannot mutate anything.

## 4. Current setup

### 4.1 Stack
Next.js 15 (App Router) · TypeScript · Prisma + PostgreSQL (Cloud SQL for
PostgreSQL, project `auxlo-503209`, instance `auxlo-db`, europe-west2) ·
Tailwind CSS (`auxlo-*` design tokens) · NextAuth v4 · SendGrid/SMTP via
`lib/email.ts` · GCP Cloud Run for deploys.

### 4.2 Environment variables (`.env`)

| Variable | Current value / state | Used by |
|---|---|---|
| `DATABASE_URL` | `postgresql://auxlo_user:…@127.0.0.1:5432/auxlo` (via proxy) | Prisma |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | `http://localhost:3000` / set | NextAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | **present** (sign-in not yet end-to-end verified) | NextAuth Google provider |
| `ADMIN_EMAILS` | `hello@auxlo.uk` | Admin bootstrap |
| `PAJO_BYPASS_AUTH` | `true` — **flip to `false` once sign-in is verified** | Middleware |
| `SENDGRID_API_KEY`, `SMTP_*` | present | Email reminders (roadmap P1) |
| `STRIPE_*` | present, unused by Pajo | Roadmap P4 auto-collection |
| `EMAIL_FROM` | `hello@auxlo.uk` | Outbound email identity |

### 4.3 Running locally (operational runbook)

```powershell
# 1. Cloud SQL proxy (must be running; Pajo 500s without it)
C:\Users\siray\Documents\Auxlo\cloud-sql-proxy.exe `
  auxlo-503209:europe-west2:auxlo-db --port 5432 --gcloud-auth

# 2. Dev server
npm run dev            # port 3000 (or next free port)

# 3. Seed / reset the review pot ("£50 A Week Thrift — Review", slug review-pot)
npm run pajo:seed         # creates: pot, cycle, 10 weeks, 10 demo members,
                          #          week-1 payments 6/10, one late escalation
npm run pajo:seed:clean   # CLEANUP=1 — deletes seeded pot + demo members

# 4. Sanity check (fast, read-only)
npx ts-node scripts/pajo-check.ts
```

Key URLs (preview mode): `/pajo` → picker; `/pajo/review-pot` → dashboard.
Symptom → fix: Pajo pages 500 with *"Can't reach database server at
127.0.0.1:5432"* → the proxy died, restart step 1.

### 4.4 Known environment caveats

1. **Migration drift (pre-existing):** historical migration files no longer
   match the database (unrelated to Pajo), so `prisma migrate deploy` is
   broken repo-wide. The Pajo schema was applied with `prisma db push` and
   verified via `prisma db pull`. Fixing the drift baseline is a separate task.
2. **Legacy type errors (pre-existing):** 4 errors in
   `components/service-business/landing/About.tsx` — untouched, block `next
   build` but not `next dev`.
3. Old New Wave / Crae Wolf artifacts are archived under `_legacy/`; the live
   codebase is Auxlo-only.

### 4.5 What has been verified

- Prisma schema validated + applied; `tsc --noEmit` clean for all Pajo files
- End-to-end smoke test against the real dev DB: create pot → members → record
  payment → escalate late (strike + £0 fee at strike 1) → mark week 1 paid out
  → cycle advanced to week 2 → ledger correct → test data cleaned up
- All 7 pages + all 5 API routes serving; unauthenticated `/pajo` redirects to
  sign-in when bypass is off; `/admin` unaffected by the bypass


## 5. Known limitations (honest list)

| # | Limitation | Impact |
|---|---|---|
| L1 | **No pot-creation UI** — `POST /api/pajo/pots` works (smoke-tested) but there is no form | New pots need an API call until Phase 0.2 |
| L2 | **No scheduler** — weeks don't auto-open, grace periods don't auto-close, late fees don't auto-apply; timing states are derived live for display, but mutations are manual | The treasurer must click escalate/payout; fine for review, not hands-off operation |
| L3 | **Emails not wired** — SendGrid creds exist, `lib/email.ts` ready, but no Pajo code calls it yet | Reminders are manual |
| L4 | **Payments are admin-marked, no bank feed** — `reference` is free text | Reconciliation is manual trust, matching the group's current bank-transfer process |
| L5 | **Auth not yet end-to-end verified** — Google creds present; sign-in, invites, role assignment untested with real users | `PAJO_BYPASS_AUTH=true` stays on until Phase 0.1 completes |
| L6 | Members need `UserProfile` + `UserMembership` rows via the existing invite flow | Onboarding 10 non-technical members needs a smooth invite path (Phase 0.3) |
| L7 | No CSV/PDF export of the ledger yet | Group-chat summaries stay manual |
| L8 | Swap-turn flow is rulebook-encoded but has no UI/API flow yet | Admin edits payout positions manually for now |

---

## 6. Roadmap

Ordered by what blocks operating the **real £50 pot** vs. what improves it.
Each phase is "done" when all its acceptance criteria (AC) pass.

### Phase 0 — Go-live blockers (before any real money)
*Goal: real people sign in; the treasurer can run week 1 of the real pot.*

- [ ] **0.1 Verify auth end-to-end** — sign in with Google (creds already set), confirm `UserProfile` upsert + `UserMembership` + session roles; grant `hello@auxlo.uk` `ORG_ADMIN` on the real pot's org. *AC: sign-in works in dev; `/pajo` protected with `PAJO_BYPASS_AUTH=false`; flag removed from `.env`.*
- [ ] **0.2 Pot creation UI** — form at `/pajo/new` (amount, member target, due day/time, grace, late fee, payout method, bank details, rules prefilled from `buildDefaultRulesText`) POSTing to the existing endpoint. *AC: create a 10-member pot fully in-browser in <2 minutes.*
- [ ] **0.3 Member invite path** — bulk email invites via `InvitationToken`; member sign-in lands on their pot. *AC: a non-technical member reaches the dashboard unaided.*
- [ ] **0.4 Create the real pot** — actual £50 circle (real names, payout order, bank details), members e-sign rules. *AC: `rulesAcceptedAt` set for all 10; consents in the audit trail.*

### Phase 1 — Hands-off weekly operation
*Goal: the treasurer's weekly routine is: confirm payments, click payout.*

- [ ] **1.1 Weekly scheduler** — `node-cron` (dev) / Cloud Scheduler → job endpoint (prod): auto-open `UPCOMING` weeks, auto-close grace, auto-apply `escalateLatePayment`, auto-flag `MISSED` after forfeit threshold; idempotent. *AC: simulating 3 weeks reproduces the rulebook with zero manual clicks.*
- [ ] **1.2 Email notifications** — weekly due reminder, grace warning, paid receipt, payout notice, escalation notice via SendGrid; suppressed in preview mode. *AC: each event sends the right template; opt-out respected.*
- [ ] **1.3 Activity feed page** — render `AuditLog` as the "no secrets" public timeline. *AC: every mutation listed with actor, what, when.*
- [ ] **1.4 Member self-service** — "I've sent it" marking (→ `PENDING_CONFIRMATION` with reference) + personal payment history; admin confirms. *AC: member action appears in ledger; one-click admin confirm.*


### Phase 2 — Group governance (the awkward conversations, automated)
*Goal: swaps, exits, and cycle endings follow the rulebook without drama.*

- [ ] **2.1 Swap-turn flow** — request swap → counterparty approves → group notified (email + feed) → payout positions swap atomically (rulebook §3). *AC: full flow auditable; double-payout impossible.*
- [ ] **2.2 Leave & replace workflow** — UI over `leavePot`/`replaceMember`: refund summary ("you get back what you paid in"), replacement inherits the leaver's paid-in, group-vote stub (rulebook §5). *AC: leaving member's status/totals correct; replacement seeded correctly.*
- [ ] **2.3 End-of-cycle settlement** — close the cycle → per-member net position summary, late-fee leftover ledger, "celebration fund vs split evenly" decision, then start cycle N+1 reusing the roster (rulebook §8). *AC: cycle 2 created from cycle 1 in one flow; leftovers accounted.*
- [ ] **2.4 Exports** — CSV/PDF of the ledger and per-member statements.

### Phase 3 — Money integrity (reduce manual trust)
*Goal: prove what landed in the bank, not just what people say they sent.*

- [ ] **3.1 Reference convention + matching** — enforce reference format `{potSlug}-{member#}-{week#}`; treasurer triage screen matching bank transfers to contributions. *AC: paste a week's statement rows → suggested matches → one-click confirm.*
- [ ] **3.2 Statement import** — CSV upload (then open-banking via TrueLayer) pre-fills the triage screen. *AC: 90%+ of payments matched without typing.*
- [ ] **3.3 Arrears dashboard** — who owes what including late fees, forfeited turns, and the rulebook §4 "pay before next cycle" enforcement.

### Phase 4 — Productisation (Pajo as an Auxlo product)
*Goal: beyond one group — sellable, self-serve, mobile-first.*

- [ ] **4.1 Public marketing page + self-serve signup** under the Auxlo brand; org self-provisioning (a new circle = a new org).
- [ ] **4.2 Auto-collection** — Stripe (keys already in env) or GoCardless Direct Debit collects the £50 automatically and marks contributions paid; UK DD suits this demographic and removes limitation L4.
- [ ] **4.3 Payout automation** — treasury account sends the weekly £500 with one approval; receipt attached to `PotWeek`.
- [ ] **4.4 Mobile-first polish + PWA** — the group lives in WhatsApp; the app must feel as fast on a phone.
- [ ] **4.5 Operator mode** — one treasurer running many circles, cross-circle reporting (the tenant model already supports it).

### Sequencing note
**Phase 0 → 1 is the critical path** to retiring the group chat + spreadsheet for
the live pot. If reconciliation pain bites before governance does, pull **3.1**
ahead of Phase 2. **4.2 changes the trust model materially** — only do it after
a full manual cycle has validated the rules engine against real behaviour.

---

## Appendix — file map

```
prisma/schema.prisma              # Pot, PotMember, PotCycle, PotWeek, Contribution + enums
lib/pajo/
  types.ts rules.ts queries.ts mutations.ts access.ts index.ts
app/(pajo)/pajo/
  page.tsx                        # pot picker
  [potSlug]/layout.tsx            # shell (Sidebar/Topbar, access + preview banner)
  [potSlug]/page.tsx              # overview
  [potSlug]/{ledger,members,payouts,rules,settings}/page.tsx
components/pajo/
  Sidebar Topbar StatCard StatusPill ContributionActions PayoutAction
app/api/pajo/
  pots/route.ts
  contributions/[contributionId]/{pay,escalate}/route.ts
  weeks/[weekId]/payout/route.ts
  members/[memberId]/accept-rules/route.ts
scripts/pajo-seed-review.ts       # demo pot seeder (npm run pajo:seed[:clean])
scripts/pajo-check.ts             # read-only sanity check
```

*Doc generated from the codebase on 2026-09-02 — every "current capability"
above is verified against running code, not planned work. Update this file as
phases ship.*



