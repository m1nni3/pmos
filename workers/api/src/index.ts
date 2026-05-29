interface Env {
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: corsHeaders })

    const body = method === 'POST' || method === 'PUT' ? await request.json().catch(() => ({})) : {}

    try {
      // ── Health ────────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/health') {
        const result = await env.DB.prepare('SELECT 1').first()
        return json({ status: 'ok', database: result ? 'connected' : 'disconnected' })
      }

      // ── Dashboard ─────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/dashboard') {
        const [props, totalValue, totalPurchase, bonds, insurance, expiringPolicies, recentActivity] = await Promise.all([
          env.DB.prepare('SELECT p.*, pd.current_market_value, pd.purchase_price FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id ORDER BY p.name').all(),
          env.DB.prepare("SELECT coalesce(sum(pd.current_market_value),0) as v FROM property_details pd").first(),
          env.DB.prepare("SELECT coalesce(sum(pd.purchase_price),0) as v FROM property_details pd").first(),
          env.DB.prepare("SELECT coalesce(sum(b.original_amount),0) as v, coalesce(sum(b.monthly_payment),0) as m FROM bonds b").first(),
          env.DB.prepare("SELECT count(*) as c, count(case when status = 'expiring_soon' then 1 end) as expiring FROM insurance_policies").first(),
          env.DB.prepare("SELECT count(*) as c FROM insurance_policies WHERE status = 'expiring_soon'").first(),
          env.DB.prepare("SELECT ph.*, p.name as property_name FROM property_history ph LEFT JOIN properties p ON p.id = ph.property_id ORDER BY ph.event_date DESC LIMIT 10").all(),
        ])

        const totalVal = (totalValue as any)?.v ?? 0
        const totalPur = (totalPurchase as any)?.v ?? 0
        const bondTotal = (bonds as any)?.v ?? 0
        const bondMonthly = (bonds as any)?.m ?? 0
        const propList = (props as any)?.results ?? []
        const totalUnits = propList.reduce((s: number, p: any) => s + p.unit_count, 0)

        return json({
          totalPortfolioValue: totalVal,
          totalPurchaseValue: totalPur,
          totalBondExposure: bondTotal,
          monthlyBondPayments: bondMonthly,
          propertiesOwned: propList.length,
          totalUnits,
          expiringPolicies: (expiringPolicies as any)?.c ?? 0,
          netYield: totalPur > 0 ? ((totalVal - totalPur) / totalPur * 100).toFixed(1) : '0.0',
          recentActivity: (recentActivity as any)?.results ?? [],
        })
      }

      // ── Properties ────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/properties') {
        const { results } = await env.DB.prepare(`
          SELECT p.*, pd.current_market_value, pd.purchase_price, pd.size_sqm, pd.suburb, pd.bedrooms, pd.bathrooms, pd.parking_bays,
            (SELECT count(*) FROM insurance_policies ip WHERE ip.property_id = p.id AND ip.status = 'expiring_soon') as insurance_alert
          FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id ORDER BY p.name
        `).all()
        return json(results)
      }

      if (method === 'GET' && pathname.match(/^\/api\/properties\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const [prop, details, bonds, insurancePolicies, valuations, contacts, history, documents] = await Promise.all([
          env.DB.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first(),
          env.DB.prepare('SELECT * FROM property_details WHERE property_id = ?').bind(id).first(),
          env.DB.prepare('SELECT * FROM bonds WHERE property_id = ? ORDER BY created_at DESC').bind(id).all(),
          env.DB.prepare('SELECT * FROM insurance_policies WHERE property_id = ? ORDER BY created_at DESC').bind(id).all(),
          env.DB.prepare('SELECT * FROM valuation_history WHERE property_id = ? ORDER BY date DESC').bind(id).all(),
          env.DB.prepare('SELECT * FROM property_contacts WHERE property_id = ? ORDER BY category, name').bind(id).all(),
          env.DB.prepare('SELECT * FROM property_history WHERE property_id = ? ORDER BY event_date DESC').bind(id).all(),
          env.DB.prepare('SELECT * FROM property_documents WHERE property_id = ? ORDER BY created_at DESC').bind(id).all(),
        ])
        if (!prop) return json({ error: 'Not found' }, 404)
        return json({
          ...prop as object,
          details: details ?? null,
          bonds: (bonds as any)?.results ?? [],
          insurance_policies: (insurancePolicies as any)?.results ?? [],
          valuations: (valuations as any)?.results ?? [],
          contacts: (contacts as any)?.results ?? [],
          history: (history as any)?.results ?? [],
          documents: (documents as any)?.results ?? [],
        })
      }

      if (method === 'GET' && pathname.match(/^\/api\/properties\/([^/]+)\/units$/)) {
        const id = pathname.split('/')[3]
        const { results } = await env.DB.prepare('SELECT * FROM units WHERE property_id = ? ORDER BY unit_number').bind(id).all()
        return json(results)
      }

      if (method === 'POST' && pathname === '/api/properties') {
        const id = crypto.randomUUID()
        const detailsId = crypto.randomUUID()
        const { name, address, scheme_name, unit_count, details } = body
        await env.DB.prepare(
          'INSERT INTO properties (id, name, address, scheme_name, unit_count) VALUES (?,?,?,?,?)'
        ).bind(id, name, address, scheme_name ?? null, unit_count ?? 1).run()
        if (details) await upsertDetails(env.DB, detailsId, id, details)
        return json({ id }, 201)
      }

      if (method === 'PUT' && pathname.match(/^\/api\/properties\/([^/]+)$/)) {
        const id = pathname.split('/')[3]
        const { name, address, scheme_name, unit_count, details } = body
        const sets: string[] = []
        const params: unknown[] = []
        for (const k of ['name', 'address', 'scheme_name', 'unit_count'] as const) {
          if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k] ?? null) }
        }
        if (sets.length) { params.push(id); await env.DB.prepare(`UPDATE properties SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
        if (details) {
          const existing = await env.DB.prepare('SELECT id FROM property_details WHERE property_id = ?').bind(id).first()
          await upsertDetails(env.DB, (existing as any)?.id ?? crypto.randomUUID(), id, details)
        }
        return json({ ok: true })
      }

      // ── Generic CRUD helper for sub-resources ─────────────────
      // Tables: bonds, insurance_policies, valuation_history, property_contacts, property_documents
      const RESOURCE_ROUTES = ['bonds', 'insurance-policies', 'valuations', 'property-contacts', 'property-documents']
      const tableMap: Record<string, string> = {
        'bonds': 'bonds', 'insurance-policies': 'insurance_policies', 'valuations': 'valuation_history',
        'property-contacts': 'property_contacts', 'property-documents': 'property_documents',
      }
      const resourceMatch = pathname.match(/^\/api\/properties\/([^/]+)\/(bonds|insurance-policies|valuations|property-contacts|property-documents)(?:\/([^/]+))?$/)

      if (resourceMatch) {
        const propertyId = resourceMatch[1]
        const resource = resourceMatch[2]
        const recordId = resourceMatch[3]
        const table = tableMap[resource]
        const allowedCols: Record<string, string[]> = {
          bonds: ['bank','account_number','original_amount','monthly_payment','expected_payoff_date','payment_method','provider_name','provider_phone','provider_email','provider_notes'],
          insurance_policies: ['insurer','broker','policy_number','policy_holder','renewal_date','geyser_excess','notes','status'],
          valuation_history: ['value','date','source','notes'],
          property_contacts: ['category','subcategory','name','phone','email','notes'],
          property_documents: ['name','category','file_url','mime_type','size_bytes','notes'],
        }

        if (method === 'GET' && !recordId) {
          const { results } = await env.DB.prepare(`SELECT * FROM ${table} WHERE property_id = ? ORDER BY created_at DESC`).bind(propertyId).all()
          return json(results)
        }

        if (method === 'GET' && recordId) {
          const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(recordId).first()
          return row ? json(row) : json({ error: 'Not found' }, 404)
        }

        if (method === 'POST') {
          const id = crypto.randomUUID()
          const cols = allowedCols[table] ?? []
          const keys = cols.filter(c => c in body)
          const vals = keys.map(k => body[k] ?? null)
          await env.DB.prepare(
            `INSERT INTO ${table} (id, property_id, ${keys.join(',')}) VALUES (?,?,${keys.map(() => '?').join(',')})`
          ).bind(id, propertyId, ...vals).run()
          const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first()
          return json(row, 201)
        }

        if (method === 'PUT' && recordId) {
          const cols = allowedCols[table] ?? []
          const keys = cols.filter(c => c in body)
          if (keys.length) {
            const sets = keys.map(k => `${k} = ?`).join(', ')
            const vals = keys.map(k => body[k] ?? null)
            await env.DB.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).bind(...vals, recordId).run()
          }
          const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(recordId).first()
          return json(row)
        }

        if (method === 'DELETE' && recordId) {
          await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(recordId).run()
          return json({ ok: true })
        }
      }

      // ── Property History (GET/POST only) ──────────────────────
      const historyMatch = pathname.match(/^\/api\/properties\/([^/]+)\/history(?:\/([^/]+))?$/)
      if (historyMatch) {
        const propertyId = historyMatch[1]
        const recordId = historyMatch[2]
        if (method === 'GET' && !recordId) {
          const { results } = await env.DB.prepare('SELECT * FROM property_history WHERE property_id = ? ORDER BY event_date DESC').bind(propertyId).all()
          return json(results)
        }
        if (method === 'POST') {
          const id = crypto.randomUUID()
          await env.DB.prepare(
            'INSERT INTO property_history (id, property_id, event_type, title, description, event_date) VALUES (?,?,?,?,?,?)'
          ).bind(id, propertyId, body.event_type, body.title, body.description ?? null, body.event_date).run()
          const row = await env.DB.prepare('SELECT * FROM property_history WHERE id = ?').bind(id).first()
          return json(row, 201)
        }
      }

      // ── Contacts ──────────────────────────────────────────────
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

      // ── Ledger ────────────────────────────────────────────────
      if (method === 'GET' && pathname.match(/^\/api\/ledger\/(rental_ledger|levy_ledger|municipality_ledger|bank_ledger)$/)) {
        const source = pathname.split('/')[3]
        const propertyId = url.searchParams.get('property_id')
        const { results } = propertyId === 'all'
          ? await env.DB.prepare(`SELECT * FROM ${source} ORDER BY date DESC LIMIT 1000`).all()
          : await env.DB.prepare(`SELECT * FROM ${source} WHERE property_id = ? ORDER BY date DESC LIMIT 1000`).bind(propertyId).all()
        return json(results)
      }

      if (method === 'POST' && pathname.match(/^\/api\/ledger\/(rental_ledger|levy_ledger|municipality_ledger|bank_ledger)$/)) {
        const source = pathname.split('/')[3]
        const entries = Array.isArray(body) ? body : [body]
        const stmt = env.DB.prepare(
          `INSERT OR IGNORE INTO ${source} (id, property_id, date, description, debit, credit, balance, reference) VALUES (?,?,?,?,?,?,?,?)`
        )
        const batch = entries.map(e =>
          stmt.bind(crypto.randomUUID(), e.property_id, e.date, e.description, e.debit ?? 0, e.credit ?? 0, e.balance ?? 0, e.reference ?? null)
        )
        const results = await env.DB.batch(batch)
        const inserted = results.filter(r => r.meta.changes > 0).length
        return json({ inserted, total: entries.length, skipped: entries.length - inserted }, 201)
      }

      if (method === 'DELETE' && pathname.match(/^\/api\/ledger\/(rental_ledger|levy_ledger|municipality_ledger|bank_ledger)$/)) {
        const source = pathname.split('/')[3]
        const propertyId = url.searchParams.get('property_id')
        if (!propertyId) return json({ error: 'property_id required' }, 400)
        if (propertyId === 'all') {
          await env.DB.prepare(`DELETE FROM ${source}`).run()
          return json({ ok: true, deleted: 'all' })
        }
        const { meta } = await env.DB.prepare(`DELETE FROM ${source} WHERE property_id = ?`).bind(propertyId).run()
        return json({ ok: true, deleted: meta.changes })
      }

      if (method === 'DELETE' && pathname.match(/^\/api\/ledger\/(rental_ledger|levy_ledger|municipality_ledger|bank_ledger)\/([^/]+)$/)) {
        const source = pathname.split('/')[3]
        const id = pathname.split('/')[4]
        const { meta } = await env.DB.prepare(`DELETE FROM ${source} WHERE id = ?`).bind(id).run()
        if (!meta.changes) return json({ error: 'Not found' }, 404)
        return json({ ok: true, deleted: 1 })
      }

      // ── Work Orders ───────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/work-orders') {
        const propertyId = url.searchParams.get('property_id')
        const status = url.searchParams.get('status')
        const clauses: string[] = []
        const params: unknown[] = []
        if (propertyId && propertyId !== 'all') { clauses.push('property_id = ?'); params.push(propertyId) }
        if (status && status !== 'all') { clauses.push('status = ?'); params.push(status) }
        const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
        const { results } = await env.DB.prepare(`SELECT * FROM work_orders${where} ORDER BY raised_at DESC`).bind(...params).all()
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

      // ── Reconciliation ────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/reconciliation') {
        const propertyId = url.searchParams.get('property_id')
        const status = url.searchParams.get('status')
        const clauses: string[] = []
        const params: unknown[] = []
        if (propertyId && propertyId !== 'all') { clauses.push('r.property_id = ?'); params.push(propertyId) }
        if (status && status !== 'all') { clauses.push('r.status = ?'); params.push(status) }
        const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
        const { results } = await env.DB.prepare(
          `SELECT r.*, (coalesce(r.bank_amount,0) - coalesce(r.rental_amount,0)) as variance FROM reconciliation r${where} ORDER BY r.period DESC`
        ).bind(...params).all()
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

      // ── Reports ───────────────────────────────────────────────
      if (method === 'GET' && pathname.match(/^\/api\/reports\/(portfolio|cashflow|reconciliation|maintenance)$/)) {
        const type = pathname.split('/')[3]
        const pid = url.searchParams.get('property_id')
        let q: string, params: unknown[]
        if (type === 'portfolio') {
          q = 'SELECT name, address, scheme_name, unit_count, created_at FROM properties'
          params = []; if (pid) { q += ' WHERE id = ?'; params.push(pid) }
          q += ' ORDER BY name'
        } else if (type === 'cashflow') {
          q = 'SELECT date, description, debit, credit, balance, reference FROM rental_ledger'
          params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
          q += ' ORDER BY date DESC LIMIT 500'
        } else if (type === 'reconciliation') {
          q = 'SELECT period, rental_amount, bank_amount, (coalesce(bank_amount,0) - coalesce(rental_amount,0)) as variance, status, notes FROM reconciliation'
          params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
          q += ' ORDER BY period DESC'
        } else {
          q = "SELECT raised_at, description, status, cost, completed_at FROM work_orders"
          params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
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
