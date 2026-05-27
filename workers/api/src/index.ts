interface Env {
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
    const body = method === 'POST' || method === 'PUT' ? await request.json().catch(() => ({})) : {}

    try {
      // ── Properties ──────────────────────────────────────────────
      if (method === 'GET' && pathname === '/api/properties') {
        const { results } = await env.DB.prepare('SELECT * FROM properties ORDER BY name').all()
        return json(results)
      }

      if (method === 'GET' && pathname.match(/^\/api\/properties\/([^/]+)\/units$/)) {
        const id = pathname.split('/')[3]
        const { results } = await env.DB.prepare('SELECT * FROM units WHERE property_id = ? ORDER BY unit_number').bind(id).all()
        return json(results)
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
      return json({ error: e instanceof Error ? e.message : 'Internal error' }, 500)
    }
  },
}
