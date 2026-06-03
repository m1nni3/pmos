# PMOS Setup Guide

## Database Setup

### Initialize the D1 Database with Schema and Seed Data

1. **Install dependencies**:
```bash
cd workers/api
npm install
```

2. **Deploy the database schema** using Wrangler:

```bash
npx wrangler d1 execute pmos-db --file schema.sql
```

This will:
- Create all necessary tables (properties, units, contacts, work orders, reconciliation, ledgers)
- Populate sample data for testing

### Running Locally

1. **Start the API server** (in one terminal):
```bash
cd workers/api
npm run dev
# API will be available at http://localhost:8787
```

2. **In another terminal, start the web app**:
```bash
cd apps/web
npm install
npm run dev
# Web app will be available at http://localhost:5173
```

The web app will proxy API requests to the Cloudflare Worker at `/api`.

### Troubleshooting

#### If you see **"Failed to load dashboard data"**:

1. **Check that the API server is running**:
   ```bash
   npm run dev
   # Should output: Listening on http://localhost:8787
   ```

2. **Verify the database has been initialized**:
   ```bash
   npx wrangler d1 execute pmos-db --command "SELECT COUNT(*) as count FROM properties"
   ```
   You should see output like: `count: 3` (with 3 sample properties)

3. **Check the API health endpoint**:
   - Open your browser and visit: `http://localhost:8787/api/health`
   - You should see: `{"status":"ok","database":"connected"}`

4. **Check browser DevTools Network tab**:
   - Open Chrome DevTools (F12)
   - Go to the Network tab
   - Reload the page
   - Look for requests to `/api/dashboard/kpis`
   - Click on the request to see the response

5. **Check for CORS issues**:
   - If you see CORS errors in the console, make sure the API server is running
   - The API should return `Access-Control-Allow-Origin: *` headers

#### If database initialization fails:

1. **Check your Wrangler version**:
   ```bash
   npx wrangler --version
   # Should be 4.0.0 or higher
   ```

2. **Check the D1 database ID** in `workers/api/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "pmos-db"
   database_id = "e5543a8a-bfb9-4d27-aa6b-fb3d7108690e"
   ```

3. **Re-run the initialization**:
   ```bash
   npx wrangler d1 execute pmos-db --file schema.sql
   ```

### Database Migrations

To make changes to the schema:

1. Update `schema.sql` with your changes
2. Re-execute the migration:
   ```bash
   npx wrangler d1 execute pmos-db --file schema.sql
   ```

Note: The current schema uses `CREATE TABLE IF NOT EXISTS` which allows safe re-execution. 
For schema updates, you may need to manually drop tables first if the changes are incompatible.

### Production Deployment

1. **Deploy to Cloudflare Workers**:
   ```bash
   cd workers/api
   npx wrangler deploy
   ```

2. **Deploy the web app** (if using Vercel):
   ```bash
   cd apps/web
   npm run build
   # Then push to GitHub to trigger Vercel deployment
   ```
