# PMOS Oversight

Trust portfolio oversight platform for managing properties, ledgers, reconciliation, and maintenance.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Data:** TanStack Query, Supabase
- **Server:** Netlify Functions
- **Charts:** Recharts
- **Validation:** Zod

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Folder Structure

| Path | Purpose |
|---|---|
| `apps/web/src/pages/` | Route-level page components |
| `apps/web/src/modules/` | Feature modules (portfolio, finance, etc.) |
| `apps/web/src/components/` | Shared UI components |
| `apps/web/src/services/` | Supabase data access layer |
| `apps/web/src/hooks/` | TanStack Query hooks |
| `apps/web/src/types/` | TypeScript type definitions |
| `netlify/functions/` | Serverless functions |
| `supabase/migrations/` | Database schema migrations |

## Core Navigation

Dashboard → Portfolio → Directory → Finance → Reconciliation → Maintenance → Reports → Settings

## Verification Workflow

```
Rental deduction: -R750 Levy
  → Search Levy Ledger
    → Found +R750 → VERIFIED
    → Not Found → EXCEPTION
```

## Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=)
