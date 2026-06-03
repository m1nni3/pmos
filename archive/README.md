# PMOS — Property Management Oversight System

A trust-level oversight platform for managing letting agents, rental collections, levy payments, and reconciliation across a property portfolio.

## Stack
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify

## Structure
```
apps/web/        — React frontend
netlify/functions/ — Serverless API
supabase/        — DB migrations & seed
```

## Getting Started
```bash
cp .env.example .env
npm install
npm run dev
```
