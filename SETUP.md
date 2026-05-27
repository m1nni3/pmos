# PMOS Setup Guide

## Database Setup

### Initialize the D1 Database with Schema and Seed Data

1. **Deploy the database schema** using Wrangler:

```bash
cd workers/api

# Execute the schema.sql file to create tables and insert seed data
npx wrangler d1 execute pmos-db --file schema.sql
```

This will:
- Create all necessary tables (properties, units, contacts, work orders, reconciliation, ledgers)
- Populate sample data for testing

### Running Locally

1. **Start the API server**:
```bash
cd workers/api
npm run dev
# API will be available at http://localhost:8787
```

2. **In another terminal, start the web app**:
```bash
cd apps/web
npm run dev
# Web app will be available at http://localhost:5173
```

The web app will proxy API requests to the Cloudflare Worker at `/api`.

### Troubleshooting

If you see **"Failed to load dashboard data"**:

1. Check that the API server is running (`npm run dev` in `workers/api`)
2. Verify the database has been initialized:
   ```bash
   npx wrangler d1 execute pmos-db --command "SELECT COUNT(*) as count FROM properties"
   ```
3. Check browser DevTools Network tab to see actual API error responses
4. Ensure CORS is properly configured if running on different ports

### Database Migrations

To make changes to the schema:

1. Update `schema.sql` with your changes
2. Re-execute the migration:
   ```bash
   npx wrangler d1 execute pmos-db --file schema.sql
   ```

Note: This will recreate tables if using `CREATE TABLE IF NOT EXISTS`
