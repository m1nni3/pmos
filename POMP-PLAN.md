# P.O.M.P — Property Oversight Management Portal

## Project Overview

A zero-cost web app for a family trust that owns 4 sectional title units. Provides dashboards for oversight of letting agents, managing agents, body corporates, finances, maintenance, and insurance. Core feature is **forensic reconciliation** — comparing letting agent ledgers against bank statements and vendor statements to flag discrepancies.

**Project name:** POMP (Property Oversight Management Portal)
**Architecture (final):** React Router (v7) + Hono API + shadcn/ui + Cloudflare Workers (fullstack, single deploy)

**Stack:**
- **Runtime:** Cloudflare Workers (edge, ~5ms cold start)
- **Framework:** React Router v7 (pages) + Hono (API) — both run in the same Worker
- **Database:** Cloudflare D1 (SQLite at edge) — already set up, zero-cost free tier
- **UI:** shadcn/ui dashboard components (tables, cards, charts, forms)
- **Charts:** Recharts
- **Auth:** Simple access code (env var) — no external auth service needed

**Users:** 5 max concurrent. Trustee(s) performing oversight.

**Budget:** $0. Cloudflare free tier.

---

## Status (as of June 2026)

### What Exists
- `/workers/api/` — Cloudflare Worker (Hono-style, D1-backed) with full CRUD API for properties, bonds, insurance, contacts, ledgers, work orders, reconciliation, petty cash
- `/apps/web/` — React 18 SPA with dashboards (Overview, Properties, Finances, Letting Agent, Management, Levies & Banking, Portfolios, Settings)
- `/apps/recon-app/` — React 19 reconciliation UI (Verification, Reporting, Administration) — hardcoded seed data
- D1 database `binos` with schema in `schema.sql`
- Notion MCP server at `/Users/m1nni3/notion mcp/` (not used for backend)

### What Changes (New Architecture)
- **Replace** the separate Worker (`workers/api/`) + SPA (`apps/web/`) with a single fullstack app
- **Single package** — one `package.json`, one `wrangler.jsonc`, one deploy
- **Keep** D1 database (already has schema and data)
- **Discard** Notion backend approach (too complex, too much manual setup)
- **Discard** Vercel/Netlify configs (not needed)

---

## Decision Boundary

| Domain | Decision Maker |
|---|---|
| Architecture, stack, code, performance, deployment | Developer (AI) |
| UI/UX look and feel | Trustee/User |
| Any cost (even $0.01/month) | Trustee/User |
| Features and outcomes | Trustee/User |
| Security and data handling | Developer (AI) |

---

## Data Model — D1 Database (SQLite)

### Existing Tables (from schema.sql)
- `properties` — name, address, scheme_name, unit_count
- `property_details` — all extended fields (valuation, bonds, municipal, agents, tenants, body corp, insurance)
- `bonds` — bank, account, amounts, payoff date
- `insurance_policies` — insurer, broker, policy number, renewal, status
- `valuation_history` — value, date, source
- `property_contacts` — category, name, phone, email
- `property_documents` — file links, category
- `property_history` — event log
- `units` — individual unit tracking
- `rental_ledger` — income/expense per property
- `levy_ledger` — levy transactions
- `municipality_ledger` — municipal payments
- `bank_ledger` — bank statement entries
- `work_orders` — maintenance tracking
- `reconciliation` — reconciliation line items
- `contacts` — vendor/contractor directory
- `petty_cash_income` / `petty_cash_expenses`

### Additions Needed
- `reconciliation_items` — 3-way matched items (letting ledger vs bank vs vendor)
- `documents` — centralized document registry
- `meetings` — body corp meeting tracking
- `portals` — login credentials store

---

## Cloudflare Worker (Hono API + React Router)

### Single project structure

```
pmos/
├── app/
│   ├── routes/            — React Router page components
│   │   ├── _index.tsx     — Overview dashboard
│   │   ├── properties.tsx — Properties list & detail
│   │   ├── finances.tsx   — Financial overview
│   │   ├── letting.tsx    — Letting agent tab
│   │   ├── management.tsx — Managing agents
│   │   ├── levies.tsx     — Levies & banking
│   │   ├── insurance.tsx  — Insurance policies
│   │   ├── maintenance.tsx— Maintenance board
│   │   ├── reconciliation.tsx — 3-way reconciliation
│   │   ├── contacts.tsx   — Contact directory
│   │   ├── documents.tsx  — Document registry
│   │   └── portals.tsx    — Portal quick-links
│   ├── components/        — shadcn/ui components
│   ├── lib/               — utilities, API client
│   └── styles.css         — Tailwind CSS
├── functions/             — Hono API routes (Workers)
│   ├── api/
│   │   ├── properties.ts
│   │   ├── finances.ts
│   │   ├── reconciliation.ts
│   │   ├── maintenance.ts
│   │   ├── contacts.ts
│   │   ├── documents.ts
│   │   └── ... (mirrors existing API)
│   └── __init.ts          — Hono app setup
├── migrations/            — D1 schema migrations
├── wrangler.jsonc         — Worker config (D1 binding, secrets)
├── package.json
└── tailwind.config.ts
```

### API Endpoints (Hono)

```
GET  /api/dashboard          — Overview metrics
GET  /api/properties         — List all
GET  /api/properties/:id     — Detail + related data
POST /api/properties         — Create
PUT  /api/properties/:id     — Update
GET  /api/properties/:id/units
GET  /api/contacts           — List contacts
POST /api/contacts           — Create
PUT  /api/contacts/:id       — Update
DELETE /api/contacts/:id
GET  /api/ledger/:source     — Ledger by type (rental/levy/municipality/bank)
POST /api/ledger/:source     — Bulk insert
DELETE /api/ledger/:source   — Clear
DELETE /api/ledger/:source/:id
GET  /api/work-orders        — Maintenance list
POST /api/work-orders        — Create
PUT  /api/work-orders/:id    — Update
GET  /api/reconciliation     — Reconciliation items
PUT  /api/reconciliation/:id — Update
GET  /api/reports/:type      — Portfolio/cashflow/reconciliation/maintenance
POST /api/reconciliation/run — Trigger reconciliation engine
```

### Reconciliation Engine
For each month, compare three sources per line item:

```
letting_ledger shows "R1,200 - Rates"
  → check bank_ledger: R1,200 withdrawal? → flag if no
  → check municipality_ledger: R1,200 received? → flag if no
  → create reconciliation_item with DISCREPANCY status
```

Frontend shows a traffic-light view: green = matched, red = discrepancy, amber = missing source.

### Reconciliation Agent (Claude Code via MCP)
The Notion MCP server (built + configured) can also be used to query reconciliation data and generate reports through natural language.

---

## Frontend Dashboards (shadcn/ui + React Router)

### Tab Structure
1. **Overview** — KPI cards (properties, occupancy, cash flow, discrepancies), recent activity feed
2. **Properties** — Table with expandable detail panels
3. **Finances** — Income/expense charts, monthly trends, petty cash
4. **Letting Agent** — Per-property agency details, tenant info, rental admin
5. **Management** — Managing agents, body corp schemes, governance docs
6. **Levies & Banking** — Levy admin, reconciliation view, bank statements
7. **Insurance** — Policies table, renewal calendar, claims history
8. **Maintenance** — Board view, frequency analysis, liability flags, receipt status
9. **Reconciliation** — Monthly 3-way matching view with red/amber/green status
10. **Contacts** — Directory with role filtering
11. **Documents** — File registry with type filtering
12. **Portals** — Quick-links to all portals with credentials

### UI Components (shadcn/ui)
- `Card` — KPI metric cards
- `Table` / `DataTable` — sortable, filterable lists
- `Tabs` — tabbed dashboards
- `Dialog` / `Sheet` — create/edit forms
- `Select` — filters and dropdowns
- `Badge` — status indicators
- `LineChart`, `BarChart` — via Recharts

---

## Implementation Roadmap

### Phase 1 — Foundation
- [x] Understand existing codebase
- [x] Decision on architecture (React Router + Hono + shadcn/ui + Workers)
- [x] Update plan document
- [ ] Scaffold new project structure
- [ ] Port existing API routes to Hono
- [ ] Verify D1 database and schema

### Phase 2 — Dashboards
- [ ] Overview page with KPI cards
- [ ] Properties page with detail panels
- [ ] Finances page with charts
- [ ] Letting Agent & Management tabs
- [ ] Levies & Banking page

### Phase 3 — Core Reconciliation
- [ ] Build reconciliation engine (3-way matching)
- [ ] Reconciliation page with traffic-light view
- [ ] Maintenance board with frequency/liability tracking

### Phase 4 — Remaining Pages
- [ ] Insurance with renewal calendar
- [ ] Contacts directory
- [ ] Documents registry
- [ ] Portals quick-links

### Phase 5 — Deploy & Polish
- [ ] Deploy to Cloudflare Workers
- [ ] Test reconciliation logic
- [ ] SEO, metadata, accessibility

---

## Cost Tracking

| Item | Cost | Status |
|---|---|---|
| Cloudflare Workers | Free (100k req/day) | ✅ Active |
| Cloudflare D1 (SQLite) | Free (5GB, 5M reads/mo) | ✅ Active |
| Custom domain (optional) | ~$10/yr | ❌ Not needed |
| shadcn/ui components | Free | ✅ |
| Recharts | Free | ✅ |

**Nothing costs money. No approval needed unless that changes.**

---

## How to Resume This Project in a New Chat

Copy-paste the following to the AI:

> I am building POMP (Property Oversight Management Portal) — a zero-cost property oversight web app for a family trust with 4 sectional tile properties. Stack: React Router (v7) + Hono API + shadcn/ui + Cloudflare Workers + D1 (SQLite).
>
> The full plan is in POMP-PLAN.md in the project root (or PMOS-PLAN.md if not renamed). Read that file, check the current state of the project, and continue development. Give me a status update on what's built and what's next.

---

## Key Commands

```bash
# Dev server
npm run dev

# Deploy
npm run deploy

# D1 migrations
npx wrangler d1 execute pmos --remote --file=migrations/001_init.sql

# Check deployed worker
npx wrangler tail
```
