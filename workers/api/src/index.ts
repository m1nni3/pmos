interface Env {
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method
    
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: corsHeaders })
    
    const body = method === 'POST' || method === 'PUT' ? await request.json().catch(() => ({})) : {}

    try {
      // ── Health Check ────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/health') {
        try {
          const result = await env.DB.prepare('SELECT 1').first()
          return json({ status: 'ok', database: 'connected' })
        } catch (err) {
          return json({ status: 'error', database: 'disconnected', message: err instanceof Error ? err.message : 'Unknown error' }, 500)
        }
      }

      // ── Properties ──────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/properties') {
        const { results } = await env.DB.prepare('SELECT * FROM properties ORDER BY name').all()
        return json(results)
      }

      if (method === 'GET' && pathname.match(/^\/api\/properties\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const [prop, details] = await Promise.all([
          env.DB.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first(),
          env.DB.prepare('SELECT * FROM property_details WHERE property_id = ?').bind(id).first(),
        ])
        if (!prop) return json({ error: 'Not found' }, 404)
        return json({ ...prop as object, details: details ?? null })
      }

      if (method === 'GET' && pathname.match(/^\/api\/properties\/([^/]+)\/units$/)) {
        const id = pathname.split('/')[3]
        const { results } = await env.DB.prepare('SELECT * FROM units WHERE property_id = ? ORDER BY unit_number').bind(id).all()
        return json(results)
      }

      // GET /api/property-details-schema — return column list for the form
      if (method === 'GET' && pathname === '/api/property-details-schema') {
        const { results } = await env.DB.prepare('PRAGMA table_info(property_details)').all()
        return json(results)
      }

      if (method === 'POST' && pathname === '/api/properties') {
        const id = crypto.randomUUID()
        const detailsId = crypto.randomUUID()
        const { name, address, scheme_name, unit_count, managing_agent_id, letting_agent_id, details } = body
        await env.DB.prepare(
          'INSERT INTO properties (id, name, address, scheme_name, unit_count, managing_agent_id, letting_agent_id) VALUES (?,?,?,?,?,?,?)'
        ).bind(id, name, address, scheme_name ?? null, unit_count ?? 1, managing_agent_id ?? null, letting_agent_id ?? null).run()
        if (details) {
          await upsertDetails(env.DB, detailsId, id, details)
        }
        return json({ id, details_id: detailsId }, 201)
      }

      if (method === 'PUT' && pathname.match(/^\/api\/properties\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const { name, address, scheme_name, unit_count, managing_agent_id, letting_agent_id, details } = body
        const sets: string[] = []
        const params: unknown[] = []
        for (const k of ['name', 'address', 'scheme_name', 'unit_count', 'managing_agent_id', 'letting_agent_id'] as const) {
          if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k] ?? null) }
        }
        if (sets.length > 0) {
          params.push(id)
          await env.DB.prepare(`UPDATE properties SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
        }
        if (details) {
          const existing = await env.DB.prepare('SELECT id FROM property_details WHERE property_id = ?').bind(id).first()
          if (existing) {
            await upsertDetails(env.DB, (existing as any).id as string, id, details)
          } else {
            await upsertDetails(env.DB, crypto.randomUUID(), id, details)
          }
        }
        return json({ ok: true })
      }

      // ── Contacts ────────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/contacts') {
        const role = url.searchParams.get('role')
        let q = 'SELECT * FROM contacts'
        const params: string[] = []
        if (role) { q += ' WHERE role = ?'; params.push(role) }
        q += ' ORDER BY name'
        const { results } = await env.DB.prepare(q).bind(...params).all()
        return json(results)
      }

      if (method === 'POST' && pathname === '/api/contacts') {
        const id = crypto.randomUUID()
        await env.DB.prepare(
          'INSERT INTO contacts (id, role, name, email, phone, address, account_number, notes) VALUES (?,?,?,?,?,?,?,?)'
        ).bind(id, body.role, body.name, body.email ?? null, body.phone ?? null, body.address ?? null, body.account_number ?? null, body.notes ?? null).run()
        const { results } = await env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).all()
        return json(results[0], 201)
      }

      if (method === 'PUT' && pathname.match(/^\/api\/contacts\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        await env.DB.prepare(
          'UPDATE contacts SET role = ?, name = ?, email = ?, phone = ?, address = ?, account_number = ?, notes = ? WHERE id = ?'
        ).bind(body.role, body.name, body.email ?? null, body.phone ?? null, body.address ?? null, body.account_number ?? null, body.notes ?? null, id).run()
        const { results } = await env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).all()
        return json(results[0])
      }

      if (method === 'DELETE' && pathname.match(/^\/api\/contacts\/([^/]+)$/)) {
        await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(pathname.split('/')[3]).run()
        return json({ ok: true })
      }

      // ── Dashboard KPIs ───────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/dashboard/kpis') {
        try {
          const [props, units, contacts, openWO, pendingRecon] = await Promise.all([
            env.DB.prepare('SELECT count(*) as c FROM properties').first(),
            env.DB.prepare('SELECT count(*) as c FROM units').first(),
            env.DB.prepare('SELECT count(*) as c FROM contacts').first(),
            env.DB.prepare("SELECT count(*) as c FROM work_orders WHERE status = 'open'").first(),
            env.DB.prepare("SELECT count(*) as c FROM reconciliation WHERE status = 'pending'").first(),
          ])
          return json({
            properties: props?.c ?? 0,
            units: units?.c ?? 0,
            contacts: contacts?.c ?? 0,
            openWorkOrders: openWO?.c ?? 0,
            pendingRecon: pendingRecon?.c ?? 0,
          })
        } catch (err) {
          console.error('Dashboard KPI error:', err)
          return json({ 
            error: 'Failed to load dashboard KPIs',
            details: err instanceof Error ? err.message : 'Unknown error'
          }, 500)
        }
      }

      // ── Ledger ──────────────────────────────────────────────────
      if (method === 'GET' && pathname.match(/^\/api\/ledger\/(rental_ledger|levy_ledger|municipality_ledger|bank_ledger)$/)) {
        const source = pathname.split('/')[3]
        const propertyId = url.searchParams.get('property_id')
        const { results } = await env.DB.prepare(
          `SELECT * FROM ${source} WHERE property_id = ? ORDER BY date DESC LIMIT 200`
        ).bind(propertyId).all()
        return json(results)
      }

      // ── Work Orders ─────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/work-orders') {
        const propertyId = url.searchParams.get('property_id')
        const status = url.searchParams.get('status')
        let q = 'SELECT * FROM work_orders WHERE property_id = ?'
        const params = [propertyId]
        if (status && status !== 'all') { q += ' AND status = ?'; params.push(status) }
        q += ' ORDER BY raised_at DESC'
        const { results } = await env.DB.prepare(q).bind(...params).all()
        return json(results)
      }

      if (method === 'POST' && pathname === '/api/work-orders') {
        const id = crypto.randomUUID()
        await env.DB.prepare(
          'INSERT INTO work_orders (id, property_id, unit_id, contractor_id, description, status) VALUES (?,?,?,?,?,?)'
        ).bind(id, body.property_id, body.unit_id ?? null, body.contractor_id ?? null, body.description, body.status ?? 'open').run()
        const { results } = await env.DB.prepare('SELECT * FROM work_orders WHERE id = ?').bind(id).all()
        return json(results[0], 201)
      }

      if (method === 'PUT' && pathname.match(/^\/api\/work-orders\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const sets: string[] = []
        const params: unknown[] = []
        for (const k of ['property_id', 'unit_id', 'contractor_id', 'description', 'status', 'completed_at', 'cost'] as const) {
          if (k in body) { sets.push(`${k} = ?`); params.push(body[k] ?? null) }
        }
        params.push(id)
        if (sets.length) await env.DB.prepare(`UPDATE work_orders SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
        const { results } = await env.DB.prepare('SELECT * FROM work_orders WHERE id = ?').bind(id).all()
        return json(results[0])
      }

      // ── Reconciliation ──────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/reconciliation') {
        const propertyId = url.searchParams.get('property_id')
        const status = url.searchParams.get('status')
        let q = 'SELECT r.*, (coalesce(r.bank_amount,0) - coalesce(r.rental_amount,0)) as variance FROM reconciliation r WHERE property_id = ?'
        const params = [propertyId]
        if (status && status !== 'all') { q += ' AND r.status = ?'; params.push(status) }
        q += ' ORDER BY r.period DESC'
        const { results } = await env.DB.prepare(q).bind(...params).all()
        return json(results)
      }

      if (method === 'PUT' && pathname.match(/^\/api\/reconciliation\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const sets: string[] = []
        const params: unknown[] = []
        for (const k of ['status', 'notes', 'rental_amount', 'bank_amount', 'period'] as const) {
          if (k in body) { sets.push(`${k} = ?`); params.push(body[k] ?? null) }
        }
        params.push(id)
        if (sets.length) await env.DB.prepare(`UPDATE reconciliation SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
        const { results } = await env.DB.prepare('SELECT * FROM reconciliation WHERE id = ?').bind(id).all()
        return json(results[0])
      }

      // ── Reports ─────────────────────────────────────────────────
      if (method === 'GET' && pathname.match(/^\/api\/reports\/(portfolio|cashflow|reconciliation|maintenance)$/)) {
        const type = pathname.split('/')[3]
        const pid = url.searchParams.get('property_id')
        let q: string, params: unknown[]
        if (type === 'portfolio') {
          q = 'SELECT name, address, scheme_name, unit_count, created_at FROM properties'
          params = []
          if (pid) { q += ' WHERE id = ?'; params.push(pid) }
          q += ' ORDER BY name'
        } else if (type === 'cashflow') {
          q = 'SELECT date, description, debit, credit, balance, reference FROM rental_ledger'
          params = []
          if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
          q += ' ORDER BY date DESC LIMIT 500'
        } else if (type === 'reconciliation') {
          q = 'SELECT period, rental_amount, bank_amount, (coalesce(bank_amount,0) - coalesce(rental_amount,0)) as variance, status, notes FROM reconciliation'
          params = []
          if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
          q += ' ORDER BY period DESC'
        } else {
          q = "SELECT raised_at, description, status, cost, completed_at FROM work_orders"
          params = []
          if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
          q += ' ORDER BY raised_at DESC'
        }
        const { results } = await env.DB.prepare(q).bind(...params).all()
        return json(results)
      }

      return json({ error: 'Not found' }, 404)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Internal error'
      console.error('API Error:', errorMessage, e)
      return json({ error: 'Internal error', details: errorMessage }, 500)
    }
  },
}

async function upsertDetails(db: any, detailsId: string, propertyId: string, d: any) {
  const cols = [
    'unit_number','door_number','erf_number','scheme_number','size_sqm','bedrooms','bathrooms','parking_bays',
    'suburb','township','lpi_code','purchase_date','purchase_price','current_market_value','title_deed_reference',
    'owner_name','owner_id','registered_owner','municipality_name','municipal_valuation','municipal_valuation_year',
    'municipal_account_number','municipal_paid_by','agency','managing_agent_name','portfolio_manager','agent_email',
    'agent_phone','account_administrator','maintenance_manager','department_head','management_fee','payment_method',
    'branch','branch_code','tenant_name','tenant_phone','tenant_email','tenant_notes','bc_name','bc_registration_number',
    'bc_bank','bc_account_name','bc_branch','bc_branch_code','bc_levy_reference','bc_levy_payment_method',
    'bc_contact_name','bc_contact_phone','bc_contact_email','bond_bank','bond_account_number','original_bond_amount',
    'monthly_bond_payment','expected_payoff_date','insurer','broker','policy_number','policy_holder','geyser_excess',
    'annual_renewal_date','insurance_contact','emergency_contact_name','emergency_contact_phone','emergency_contact_email',
    'emergency_contact_notes',
  ]
  const sets = cols.map(c => `${c} = ?`).join(', ')
  const vals = cols.map(c => d[c] ?? null)
  await db.prepare(
    `INSERT INTO property_details (id, property_id, ${cols.join(',')}) VALUES (?,?,${cols.map(() => '?').join(',')}) ON CONFLICT(property_id) DO UPDATE SET ${sets}`
  ).bind(detailsId, propertyId, ...vals).run()
}
