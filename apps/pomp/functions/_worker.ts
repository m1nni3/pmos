import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Env }>()

app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ── Helpers ──────────────────────────────────────────────
function uuid() { return crypto.randomUUID() }

// Properties excluded from portal display (data retained in DB)
const HIDDEN_PROPERTIES = ['p1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000007']
const HIDDEN_PROPS_SQL = HIDDEN_PROPERTIES.map(() => '?').join(',')

// ── Health ────────────────────────────────────────────────
app.get('/api/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first()
    return c.json({ status: 'ok' })
  } catch { return c.json({ status: 'error' }, 500) }
})

// ── Dashboard ────────────────────────────────────────────
app.get('/api/dashboard', async (c) => {
  const [props, rentalSum, levySum, bankSum, munSum, reconSum] = await Promise.all([
    c.env.DB.prepare(`
      SELECT p.*, pd.current_market_value, pd.purchase_price
      FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id
      WHERE p.id NOT IN (${HIDDEN_PROPS_SQL})
      ORDER BY p.name
    `).bind(...HIDDEN_PROPERTIES).all(),
    c.env.DB.prepare("SELECT coalesce(sum(credit),0) as income, coalesce(sum(debit),0) as expenses FROM rental_ledger").first(),
    c.env.DB.prepare("SELECT coalesce(sum(credit),0) as income, coalesce(sum(debit),0) as expenses FROM levy_ledger").first(),
    c.env.DB.prepare("SELECT coalesce(sum(credit),0) as deposits, coalesce(sum(debit),0) as withdrawals FROM bank_ledger").first(),
    c.env.DB.prepare("SELECT coalesce(sum(debit),0) as total FROM municipality_ledger").first(),
    c.env.DB.prepare("SELECT status, ledger_type, count(*) as cnt, round(sum(variance),2) as var FROM reconciliation GROUP BY status, ledger_type").all(),
  ])
  const propList = props.results || []
  const totalVal = propList.reduce((s: number, p: any) => s + (p.current_market_value || 0), 0)
  const reconMap: Record<string, any> = {}
  for (const r of (reconSum.results || []) as any[]) {
    reconMap[`${r.ledger_type}_${r.status}`] = { count: r.cnt, variance: r.var }
  }
  return c.json({
    totalProperties: propList.length,
    totalUnits: propList.reduce((s: number, p: any) => s + (p.unit_count || 1), 0),
    totalValue: totalVal,
    rentalIncome: (rentalSum as any)?.income || 0,
    rentalExpenses: (rentalSum as any)?.expenses || 0,
    levyIncome: (levySum as any)?.income || 0,
    levyExpenses: (levySum as any)?.expenses || 0,
    bankDeposits: (bankSum as any)?.deposits || 0,
    bankWithdrawals: (bankSum as any)?.withdrawals || 0,
    municipalityTotal: (munSum as any)?.total || 0,
    reconciliation: reconMap,
    properties: propList,
  })
})

// ── Properties ────────────────────────────────────────────
app.get('/api/properties', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, pd.current_market_value, pd.purchase_price, pd.suburb FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id WHERE p.id NOT IN (${HIDDEN_PROPS_SQL}) ORDER BY p.name`
  ).bind(...HIDDEN_PROPERTIES).all()
  return c.json(results)
})

app.get('/api/properties/:id', async (c) => {
  const id = c.req.param('id')
  const prop = await c.env.DB.prepare('SELECT p.*, pd.* FROM properties p LEFT JOIN property_details pd ON pd.property_id = p.id WHERE p.id = ?').bind(id).first()
  if (!prop) return c.json({ error: 'not found' }, 404)
  const [bonds, insurance, units, history] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM bonds WHERE property_id = ?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM insurance_policies WHERE property_id = ?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM units WHERE property_id = ?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM property_history WHERE property_id = ? ORDER BY event_date DESC').bind(id).all(),
  ])
  return c.json({ ...prop as any, bonds: bonds.results, insurance: insurance.results, units: units.results, history: history.results })
})

app.post('/api/properties', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO properties (id, name, address, scheme_name, unit_count) VALUES (?,?,?,?,?)'
  ).bind(id, body.name, body.address || null, body.scheme_name || null, body.unit_count || 1).run()
  return c.json({ id }, 201)
})

app.put('/api/properties/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  for (const k of ['name', 'address', 'scheme_name', 'unit_count'] as const) {
    if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k]) }
  }
  if (sets.length) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE properties SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`).bind(...params).run()
  }
  return c.json({ ok: true })
})

// ── Ledger (shared handler for all 4 ledgers) ────────────
const LEDGERS = ['rental_ledger', 'levy_ledger', 'municipality_ledger', 'bank_ledger']

LEDGERS.forEach(ledger => {
  app.get(`/api/ledger/${ledger}`, async (c) => {
    const p = c.req.query('property_id')
    const page = Math.max(1, parseInt(c.req.query('page') || '1'))
    const pageSize = Math.min(500, Math.max(10, parseInt(c.req.query('pageSize') || '100')))
    const offset = (page - 1) * pageSize
    const search = c.req.query('search') || ''

    const where: string[] = [`property_id NOT IN (${HIDDEN_PROPS_SQL})`]
    const params: any[] = [...HIDDEN_PROPERTIES]
    if (p && p !== 'all') { where.push('property_id = ?'); params.push(p) }
    if (search) { where.push('description LIKE ?'); params.push(`%${search}%`) }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : ''

    const countQuery = `SELECT count(*) as total FROM ${ledger}${whereSql}`
    const dataQuery = `SELECT * FROM ${ledger}${whereSql} ORDER BY date DESC LIMIT ? OFFSET ?`

    const countRow = await c.env.DB.prepare(countQuery).bind(...params).first() as any
    const dataParams = [...params, pageSize, offset]
    const { results } = await c.env.DB.prepare(dataQuery).bind(...dataParams).all()

    return c.json({ entries: results, total: countRow?.total || 0, page, pageSize, totalPages: Math.ceil((countRow?.total || 0) / pageSize) })
  })

  app.post(`/api/ledger/${ledger}`, async (c) => {
    const body = await c.req.json()
    const entries = Array.isArray(body) ? body : [body]
    const stmt = c.env.DB.prepare(
      `INSERT INTO ${ledger} (id, property_id, date, description, debit, credit, balance, reference, category) VALUES (?,?,?,?,?,?,?,?,?)`
    )
    const batch = entries.map((e: any) =>
      stmt.bind(uuid(), e.property_id, e.date, e.description, e.debit || 0, e.credit || 0, e.balance || 0, e.reference || null, e.category || null)
    )
    const results = await c.env.DB.batch(batch)
    const inserted = results.filter(r => r.meta.changes > 0).length
    return c.json({ inserted, total: entries.length }, 201)
  })

  app.delete(`/api/ledger/${ledger}/:id`, async (c) => {
    const id = c.req.param('id')
    await c.env.DB.prepare(`DELETE FROM ${ledger} WHERE id = ?`).bind(id).run()
    return c.json({ ok: true })
  })
})

// ── Reconciliation ───────────────────────────────────────
app.get('/api/reconciliation', async (c) => {
  const p = c.req.query('property_id')
  const status = c.req.query('status')
  const lt = c.req.query('ledger_type')
  const clauses: string[] = [`r.property_id NOT IN (${HIDDEN_PROPS_SQL})`]
  const params: any[] = [...HIDDEN_PROPERTIES]
  if (p && p !== 'all') { clauses.push('r.property_id = ?'); params.push(p) }
  if (status && status !== 'all') { clauses.push('r.status = ?'); params.push(status) }
  if (lt && lt !== 'all') { clauses.push('r.ledger_type = ?'); params.push(lt) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
  const { results } = await c.env.DB.prepare(
    `SELECT r.*, p.name as property_name FROM reconciliation r LEFT JOIN properties p ON p.id = r.property_id${where} ORDER BY r.period DESC`
  ).bind(...params).all()
  return c.json(results)
})

app.put('/api/reconciliation/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  for (const k of ['status', 'notes', 'ledger_amount', 'bank_amount', 'vendor_amount'] as const) {
    if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k]) }
  }
  sets.push("updated_at = datetime('now')")
  params.push(id)
  await c.env.DB.prepare(`UPDATE reconciliation SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  return c.json({ ok: true })
})

app.post('/api/reconciliation/run', async (c) => {
  const body = await c.req.json()
  const propertyId = body.property_id
  const preserveStatuses = body.preserve !== false  // default true

  const sources: { table: string, type: string, field: string }[] = [
    { table: 'rental_ledger', type: 'rental', field: 'income' },
    { table: 'levy_ledger', type: 'levy', field: 'income' },
  ]

  // Pull existing records we want to preserve (only for the property scope)
  let existing: Record<string, any> = {}
  if (preserveStatuses) {
    let q = 'SELECT * FROM reconciliation'
    const params: any[] = []
    if (propertyId && propertyId !== 'all') { q += ' WHERE property_id = ?'; params.push(propertyId) }
    const { results } = await c.env.DB.prepare(q).bind(...params).all() as any
    for (const r of results) existing[`${r.property_id}|${r.period}|${r.ledger_type}`] = r
  } else {
    await c.env.DB.prepare('DELETE FROM reconciliation').run()
  }

  let totalKeys = 0
  let inserted = 0
  let updated = 0
  for (const src of sources) {
    const { results: ledger } = (await c.env.DB.prepare(
      `SELECT property_id, strftime('%Y-%m', date) as period, cast(sum(credit) as real) as ${src.field} FROM ${src.table} GROUP BY property_id, period ORDER BY period`
    ).all()) as any

    const { results: bank } = (await c.env.DB.prepare(
      `SELECT property_id, strftime('%Y-%m', date) as period, cast(sum(credit) as real) as deposits FROM bank_ledger GROUP BY property_id, period ORDER BY period`
    ).all()) as any

    const ledgerMap: Record<string, any> = {}
    const bankMap: Record<string, any> = {}

    for (const r of ledger) {
      const key = `${r.property_id}|${r.period}`
      if (!propertyId || propertyId === 'all' || propertyId === r.property_id) ledgerMap[key] = r
    }
    for (const b of bank) {
      const key = `${b.property_id}|${b.period}`
      if (!propertyId || propertyId === 'all' || propertyId === b.property_id) bankMap[key] = b
    }

    const allKeys = [...new Set([...Object.keys(ledgerMap), ...Object.keys(bankMap)])]
    totalKeys += allKeys.length

    const batch: any[] = []
    for (const key of allKeys) {
      const sep = key.indexOf('|')
      const pid = key.substring(0, sep)
      const period = key.substring(sep + 1)
      const ledgerAmt = ledgerMap[key]?.income || 0
      const bankAmt = bankMap[key]?.deposits || 0
      const ledgerRounded = Math.round(ledgerAmt * 100) / 100
      const bankRounded = Math.round(bankAmt * 100) / 100
      const autoStatus = Math.abs(bankAmt - ledgerAmt) < 1 ? 'matched' : 'exception'
      const existingKey = `${pid}|${period}|${src.type}`
      const prior = existing[existingKey]

      // Remove old entry, will re-insert with preserved fields if any
      if (prior) {
        // Preserve manual edits: if status was changed away from the auto status, or if there are notes, keep them
        const preserveStatus = prior.status && prior.status !== 'matched' && prior.status !== 'exception' ? prior.status : autoStatus
        const preserveNotes = prior.notes || null
        const preserveResolvedAt = prior.resolved_at || null
        batch.push(c.env.DB.prepare('DELETE FROM reconciliation WHERE id = ?').bind(prior.id))
        batch.push(c.env.DB.prepare(
          'INSERT INTO reconciliation (id, property_id, period, ledger_type, ledger_amount, bank_amount, status, notes, resolved_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))'
        ).bind(prior.id, pid, period, src.type, ledgerRounded, bankRounded, preserveStatus, preserveNotes, preserveResolvedAt, prior.created_at || null))
        updated++
      } else {
        batch.push(c.env.DB.prepare(
          'INSERT INTO reconciliation (id, property_id, period, ledger_type, ledger_amount, bank_amount, status) VALUES (?,?,?,?,?,?,?)'
        ).bind(uuid(), pid, period, src.type, ledgerRounded, bankRounded, autoStatus))
        inserted++
      }
    }

    if (batch.length) await c.env.DB.batch(batch)
  }

  return c.json({ reconciled: totalKeys, inserted, updated, preserved: Object.keys(existing).length })
})

app.get('/api/reconciliation/summary', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT ledger_type, status, count(*) as count, round(sum(ledger_amount),2) as total_ledger, round(sum(bank_amount),2) as total_bank, round(sum(variance),2) as total_variance FROM reconciliation GROUP BY ledger_type, status ORDER BY ledger_type, status"
  ).all()
  const totals = { rental: { matched: 0, exception: 0, totalVariance: 0 }, levy: { matched: 0, exception: 0, totalVariance: 0 } }
  for (const r of results as any[]) {
    const t = totals[r.ledger_type as keyof typeof totals]
    if (t) {
      t[r.status as 'matched' | 'exception'] = r.count
      t.totalVariance = r.total_variance
    }
  }
  return c.json(totals)
})

// ── Work Orders ─────────────────────────────────────────
app.get('/api/work-orders', async (c) => {
  const p = c.req.query('property_id')
  const status = c.req.query('status')
  const page = Math.max(1, parseInt(c.req.query('page') || '1'))
  const pageSize = Math.min(200, Math.max(10, parseInt(c.req.query('pageSize') || '50')))
  const offset = (page - 1) * pageSize
  const clauses: string[] = []
  const params: any[] = []
  if (p && p !== 'all') { clauses.push('property_id = ?'); params.push(p) }
  if (status && status !== 'all') { clauses.push('status = ?'); params.push(status) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''

  const countRow = await c.env.DB.prepare(`SELECT count(*) as total FROM work_orders${where}`).bind(...params).first() as any
  const { results } = await c.env.DB.prepare(
    `SELECT wo.*, p.name as property_name FROM work_orders wo LEFT JOIN properties p ON p.id = wo.property_id${where} ORDER BY wo.raised_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, pageSize, offset).all()
  return c.json({ entries: results, total: countRow?.total || 0, page, pageSize, totalPages: Math.ceil((countRow?.total || 0) / pageSize) })
})

app.post('/api/work-orders', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO work_orders (id, property_id, unit_id, contractor_id, description, status, urgency, liability, cost_estimate) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.unit_id || null, body.contractor_id || null, body.description, body.status || 'open', body.urgency || 'routine', body.liability || null, body.cost_estimate || null).run()
  return c.json({ id }, 201)
})

app.put('/api/work-orders/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  for (const k of ['description', 'status', 'urgency', 'liability', 'cost_estimate', 'actual_cost', 'receipt_received', 'completed_at'] as const) {
    if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k]) }
  }
  if (sets.length) { params.push(id); await c.env.DB.prepare(`UPDATE work_orders SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
  return c.json({ ok: true })
})

app.delete('/api/work-orders/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM work_orders WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

// ── Contacts ────────────────────────────────────────────
app.get('/api/contacts', async (c) => {
  const role = c.req.query('role')
  let q = 'SELECT * FROM contacts'
  const params: any[] = []
  if (role) { q += ' WHERE role = ?'; params.push(role) }
  q += ' ORDER BY name'
  const { results } = await c.env.DB.prepare(q).bind(...params).all()
  return c.json(results)
})

app.post('/api/contacts', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO contacts (id, role, name, email, phone, address, account_number, notes) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, body.role, body.name, body.email || null, body.phone || null, body.address || null, body.account_number || null, body.notes || null).run()
  return c.json({ id }, 201)
})

app.put('/api/contacts/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  await c.env.DB.prepare(
    'UPDATE contacts SET role = ?, name = ?, email = ?, phone = ?, address = ?, account_number = ?, notes = ? WHERE id = ?'
  ).bind(body.role, body.name, body.email || null, body.phone || null, body.address || null, body.account_number || null, body.notes || null, id).run()
  return c.json({ ok: true })
})

app.delete('/api/contacts/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ── Documents ───────────────────────────────────────────
app.get('/api/documents', async (c) => {
  const p = c.req.query('property_id')
  const cat = c.req.query('category')
  const clauses: string[] = []
  const params: any[] = []
  if (p && p !== 'all') { clauses.push('property_id = ?'); params.push(p) }
  if (cat && cat !== 'all') { clauses.push('category = ?'); params.push(cat) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
  const { results } = await c.env.DB.prepare(`SELECT * FROM documents${where} ORDER BY created_at DESC`).bind(...params).all()
  return c.json(results)
})

app.post('/api/documents', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO documents (id, property_id, name, category, file_url, mime_type, size_bytes, notes, expiry_date) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id || null, body.name, body.category, body.file_url || null, body.mime_type || null, body.size_bytes || null, body.notes || null, body.expiry_date || null).run()
  return c.json({ id }, 201)
})

// ── Insurance ───────────────────────────────────────────
// ── Bonds ───────────────────────────────────────────────
app.get('/api/bonds', async (c) => {
  const p = c.req.query('property_id')
  const { results } = p && p !== 'all'
    ? await c.env.DB.prepare(`
      SELECT b.*, p.name as property_name, p.address, p.scheme_name
      FROM bonds b LEFT JOIN properties p ON p.id = b.property_id
      WHERE b.property_id = ? ORDER BY b.bank
    `).bind(p).all()
    : await c.env.DB.prepare(`
      SELECT b.*, p.name as property_name, p.address, p.scheme_name
      FROM bonds b LEFT JOIN properties p ON p.id = b.property_id
      ORDER BY p.name, b.bank
    `).all()

  // Compute amortization for each bond
  const now = new Date()
  for (const bond of results as any[]) {
    const original = bond.original_amount || 0
    const monthly = bond.monthly_payment || 0
    const payoffYear = parseInt(bond.expected_payoff_date) || now.getFullYear() + 1
    const totalMonths = (payoffYear - now.getFullYear()) * 12 + (now.getMonth() + 1)
    const totalToPay = monthly * Math.max(0, totalMonths)
    const totalInterest = totalToPay - original
    bond.total_months_remaining = totalMonths
    bond.total_to_pay = Math.round(totalToPay * 100) / 100
    bond.total_interest = Math.round(totalInterest * 100) / 100
    bond.months_paid = 0
    bond.balance_remaining = original
    // Estimate balance: simple interest calculation
    if (monthly > 0 && original > 0) {
      // Approximate remaining balance using standard amortization formula
      // r = monthly interest rate = (yearlyRate/12). Estimate yearly rate from total payments.
      const monthsOriginal = totalMonths || 240
      const r = monthly && original ? (monthly * monthsOriginal - original) / (original * monthsOriginal * (monthsOriginal + 1) / 2) : 0
      // Simpler: assume r = 0.011 (typical 13% p.a.)
      const monthlyRate = r > 0 ? r : 0.011
      let bal = original
      for (let m = 0; m < (totalMonths || 0) && bal > 0; m++) {
        const interest = bal * monthlyRate
        const principal = Math.max(0, monthly - interest)
        bal -= principal
        bond.months_paid = m + 1
        if (bal < 0) bal = 0
      }
      bond.balance_remaining = Math.round(bal * 100) / 100
    }
  }
  return c.json(results)
})

app.post('/api/bonds', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO bonds (id, property_id, bank, account_number, original_amount, monthly_payment, expected_payoff_date, payment_method, provider_name, provider_phone, provider_email, provider_notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.bank, body.account_number || null, body.original_amount || 0, body.monthly_payment || 0, body.expected_payoff_date || null, body.payment_method || null, body.provider_name || null, body.provider_phone || null, body.provider_email || null, body.provider_notes || null).run()
  return c.json({ id }, 201)
})

app.put('/api/bonds/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  for (const k of ['bank', 'account_number', 'original_amount', 'monthly_payment', 'expected_payoff_date', 'payment_method', 'provider_name', 'provider_phone', 'provider_email', 'provider_notes'] as const) {
    if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k]) }
  }
  if (sets.length) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE bonds SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  }
  return c.json({ ok: true })
})

app.delete('/api/bonds/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM bonds WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

// ── Insurance (BC-managed, read-only reference) ─────
app.get('/api/insurance', async (c) => {
  const p = c.req.query('property_id')
  const { results } = p && p !== 'all'
    ? await c.env.DB.prepare('SELECT * FROM insurance_policies WHERE property_id = ? ORDER BY renewal_date').bind(p).all()
    : await c.env.DB.prepare('SELECT * FROM insurance_policies ORDER BY renewal_date').all()
  return c.json(results)
})

app.post('/api/insurance', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO insurance_policies (id, property_id, insurer, broker, policy_number, policy_holder, coverage_amount, excess, premium, renewal_date, status, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.insurer, body.broker || null, body.policy_number, body.policy_holder || null, body.coverage_amount || 0, body.excess || 0, body.premium || 0, body.renewal_date || null, body.status || 'active', body.notes || null).run()
  return c.json({ id }, 201)
})

// ── Ledger Mapping ────────────────────────────────────────
app.get('/api/ledger/mapping', async (c) => {
  const propertyId = c.req.query('property_id')
  const ledgerType = c.req.query('ledger_type')
  const isActive = c.req.query('is_active')
  
  let q = 'SELECT * FROM ledger_mapping'
  const params: any[] = []
  const clauses: string[] = []
  
  if (propertyId) {
    // propertyId can be a specific ID or 'all' or null
    // We want to include rules that are either global (property_id IS NULL) or match the property
    clauses.push('(property_id IS NULL OR property_id = ?)')
    params.push(propertyId)
  }
  
  if (ledgerType && ledgerType !== 'all') {
    clauses.push('ledger_type = ?')
    params.push(ledgerType)
  }
  
  if (isActive !== undefined && isActive !== '') {
    clauses.push('is_active = ?')
    params.push(isActive === '1' || isActive === 'true' ? 1 : 0)
  }
  
  if (clauses.length) {
    q += ' WHERE ' + clauses.join(' AND ')
  }
  
  q += ' ORDER BY priority DESC, created_at DESC'
  
  const { results } = await c.env.DB.prepare(q).bind(...params).all()
  return c.json(results)
})

app.post('/api/ledger/mapping', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  
  // Validate required fields
  if (!body.ledger_type || !body.pattern || !body.category) {
    return c.json({ error: 'ledger_type, pattern, and category are required' }, 400)
  }
  
  await c.env.DB.prepare(
    'INSERT INTO ledger_mapping (id, property_id, ledger_type, pattern, category, priority, is_active) VALUES (?,?,?,?,?,?,?)'
  ).bind(
    id,
    body.property_id || null,
    body.ledger_type,
    body.pattern,
    body.category,
    body.priority !== undefined ? body.priority : 0,
    body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
  ).run()
  
  return c.json({ id }, 201)
})

app.put('/api/ledger/mapping/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const sets: string[] = []
  const params: any[] = []
  
  const fields = ['property_id', 'ledger_type', 'pattern', 'category', 'priority', 'is_active']
  for (const field of fields) {
    if (field in body) {
      sets.push(`${field} = ?`)
      // Handle boolean for is_active
      if (field === 'is_active') {
        params.push(body[field] ? 1 : 0)
      } else {
        params.push(body[field])
      }
    }
  }
  
  if (sets.length) {
    sets.push('updated_at = datetime(\'now\')')
    params.push(id)
    await c.env.DB.prepare(`UPDATE ledger_mapping SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  }
  
  return c.json({ ok: true })
})

app.delete('/api/ledger/mapping/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM ledger_mapping WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

// ── Reports ─────────────────────────────────────────────
app.get('/api/reports/:type', async (c) => {
  const type = c.req.param('type')
  const pid = c.req.query('property_id')
  let q: string, params: any[]
  if (type === 'portfolio') {
    q = 'SELECT name, address, scheme_name, unit_count FROM properties'
    params = []; if (pid) { q += ' WHERE id = ?'; params.push(pid) }
    q += ' ORDER BY name'
  } else if (type === 'cashflow') {
    q = 'SELECT date, description, debit, credit, balance, reference, category FROM rental_ledger'
    params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
    q += ' ORDER BY date DESC LIMIT 500'
  } else if (type === 'reconciliation') {
    q = 'SELECT period, ledger_amount, bank_amount, variance, status, notes FROM reconciliation'
    params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
    q += ' ORDER BY period DESC'
  } else if (type === 'maintenance') {
    q = "SELECT description, status, urgency, liability, cost_estimate, actual_cost, receipt_received, raised_at, completed_at FROM work_orders"
    params = []; if (pid) { q += ' WHERE property_id = ?'; params.push(pid) }
    q += ' ORDER BY raised_at DESC'
  } else return c.json({ error: 'unknown report type' }, 400)
  const { results } = await c.env.DB.prepare(q).bind(...params).all()
  return c.json(results)
})

// ── Property Details (editing) ─────────────────────────
app.get('/api/properties/:id/details', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT * FROM property_details WHERE property_id = ?').bind(id).first()
  return c.json(row || {})
})

app.put('/api/properties/:id/details', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const fields = [
    'unit_number','door_number','erf_number','scheme_number','size_sqm','bedrooms','bathrooms','parking_bays',
    'suburb','township','lpi_code','purchase_date','purchase_price','current_market_value','valuation_date',
    'title_deed_reference','owner_name','owner_id','registered_owner',
    'municipality_name','municipal_valuation','municipal_valuation_year','municipal_account_number','municipal_paid_by',
    'agency','managing_agent_name','managing_agency','portfolio_manager','agent_email','agent_phone','account_administrator',
    'maintenance_manager','department_head','management_fee','payment_method','branch','branch_code',
    'tenant_name','tenant_phone','tenant_email','tenant_notes','lease_expiry',
    'bc_name','bc_registration_number','bc_bank','bc_account_name','bc_branch','bc_branch_code',
    'bc_levy_reference','bc_levy_payment_method','bc_contact_name','bc_contact_phone','bc_contact_email',
    'bond_bank','bond_account_number','original_bond_amount','monthly_bond_payment','expected_payoff_date',
    'bond_endorsement','bond_endorsement_date','bond_status',
    'insurer','broker','policy_number','policy_holder','geyser_excess','annual_renewal_date','insurance_contact',
    'emergency_contact_name','emergency_contact_phone','emergency_contact_email','emergency_contact_notes',
  ]
  // Check if row exists
  const existing = await c.env.DB.prepare('SELECT id FROM property_details WHERE property_id = ?').bind(id).first()
  if (existing) {
    const sets = fields.filter(f => f in body).map(f => `${f} = ?`)
    const vals = fields.filter(f => f in body).map(f => (body as any)[f] ?? null)
    if (sets.length) {
      vals.push(id)
      await c.env.DB.prepare(`UPDATE property_details SET ${sets.join(', ')} WHERE property_id = ?`).bind(...vals).run()
    }
  } else {
    const insertFields = ['id', 'property_id', ...fields.filter(f => f in body)]
    const insertVals = [uuid(), id, ...fields.filter(f => f in body).map(f => (body as any)[f] ?? null)]
    await c.env.DB.prepare(`INSERT INTO property_details (${insertFields.join(', ')}) VALUES (${insertVals.map(() => '?').join(', ')})`).bind(...insertVals).run()
  }
  return c.json({ ok: true })
})

// ── Property Contacts ──────────────────────────────────
app.get('/api/property-contacts', async (c) => {
  const pid = c.req.query('property_id')
  const cat = c.req.query('category')
  const clauses: string[] = []
  const params: any[] = []
  if (pid && pid !== 'all') { clauses.push('property_id = ?'); params.push(pid) }
  if (cat && cat !== 'all') { clauses.push('category = ?'); params.push(cat) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
  const { results } = await c.env.DB.prepare(`SELECT * FROM property_contacts${where} ORDER BY category, name`).bind(...params).all()
  return c.json(results)
})

app.post('/api/property-contacts', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO property_contacts (id, property_id, category, subcategory, name, phone, email, notes) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.category, body.subcategory || null, body.name, body.phone || null, body.email || null, body.notes || null).run()
  logActivity(c, 'create', 'property-contact', id, body.name)
  return c.json({ id }, 201)
})

app.put('/api/property-contacts/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  await c.env.DB.prepare(
    'UPDATE property_contacts SET category=?, subcategory=?, name=?, phone=?, email=?, notes=? WHERE id=?'
  ).bind(body.category, body.subcategory || null, body.name, body.phone || null, body.email || null, body.notes || null, id).run()
  logActivity(c, 'update', 'property-contact', id, body.name)
  return c.json({ ok: true })
})

app.delete('/api/property-contacts/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM property_contacts WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'property-contact', id, '')
  return c.json({ ok: true })
})

// ── Property Documents ──────────────────────────────────
app.get('/api/property-documents', async (c) => {
  const pid = c.req.query('property_id')
  const cat = c.req.query('category')
  const clauses: string[] = []
  const params: any[] = []
  if (pid && pid !== 'all') { clauses.push('d.property_id = ?'); params.push(pid) }
  if (cat && cat !== 'all') { clauses.push('d.category = ?'); params.push(cat) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
  const { results } = await c.env.DB.prepare(
    `SELECT d.*, p.name as property_name FROM property_documents d LEFT JOIN properties p ON p.id = d.property_id${where} ORDER BY d.created_at DESC`
  ).bind(...params).all()
  return c.json(results)
})

app.post('/api/property-documents', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO property_documents (id, property_id, name, category, file_url, mime_type, size_bytes, notes) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.name, body.category, body.file_url || null, body.mime_type || null, body.size_bytes || null, body.notes || null).run()
  return c.json({ id }, 201)
})

app.delete('/api/property-documents/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM property_documents WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ── P&L (Profit & Loss) ─────────────────────────────────
app.get('/api/pnl', async (c) => {
  const pid = c.req.query('property_id')
  const year = c.req.query('year') || String(new Date().getFullYear())
  const clause = pid && pid !== 'all' ? 'WHERE property_id = ? AND year = ?' : 'WHERE year = ?'
  const params: any[] = pid && pid !== 'all' ? [pid, year] : [year]

  const { results: actuals } = await c.env.DB.prepare(
    `SELECT * FROM pl_monthly ${clause}`
  ).bind(...params).all() as any

  // Group by category_key, return as monthly arrays
  const grouped: Record<string, { month: string; amount: number }[]> = {}
  for (const r of actuals as any[]) {
    if (!grouped[r.category_key]) grouped[r.category_key] = []
    grouped[r.category_key].push({ month: String(r.month), amount: r.amount })
  }

  return c.json({
    rentalIncome: grouped.rentalIncome || [],
    levy: grouped.levy || [],
    bondPayments: grouped.bondPayments || [],
    commission: grouped.commission || [],
    maintenance: grouped.maintenance || [],
    municipal: grouped.municipal || [],
    year,
  })
})

// ── Budgets ─────────────────────────────────────────────
app.post('/api/budgets', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO budgets (id, property_id, year, month, category, budget_amount) VALUES (?,?,?,?,?,?)'
  ).bind(id, body.property_id, body.year, body.month, body.category, body.budget_amount).run()
  return c.json({ id }, 201)
})

app.put('/api/budgets/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  await c.env.DB.prepare(
    'UPDATE budgets SET budget_amount = ? WHERE id = ?'
  ).bind(body.budget_amount, id).run()
  return c.json({ ok: true })
})

// ── Petty Cash ──────────────────────────────────────────
app.get('/api/petty-cash', async (c) => {
  const pid = c.req.query('property_id')
  const clauses: string[] = []
  const params: any[] = []
  if (pid && pid !== 'all') { clauses.push('property_id = ?'); params.push(pid) }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''

  const { results: income } = await c.env.DB.prepare(`SELECT *, 'income' as type FROM petty_cash_income${where} ORDER BY date DESC LIMIT 200`).bind(...params).all()
  const { results: expenses } = await c.env.DB.prepare(`SELECT *, 'expense' as type FROM petty_cash_expenses${where} ORDER BY date DESC LIMIT 200`).bind(...params).all()

  const totalIncome = (income as any[]).reduce((s: number, r: any) => s + r.amount, 0)
  const totalExpenses = (expenses as any[]).reduce((s: number, r: any) => s + r.amount, 0)

  return c.json({ income, expenses, totalIncome, totalExpenses, balance: totalIncome - totalExpenses })
})

app.post('/api/petty-cash/income', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO petty_cash_income (id, property_id, date, description, amount, category, receipt_url, notes) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id || null, body.date, body.description, body.amount, body.category || null, body.receipt_url || null, body.notes || null).run()
  logActivity(c, 'create', 'petty-cash-income', id, body.description)
  return c.json({ id }, 201)
})

app.delete('/api/petty-cash/income/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM petty_cash_income WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'petty-cash-income', id, '')
  return c.json({ ok: true })
})

app.post('/api/petty-cash/expenses', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO petty_cash_expenses (id, property_id, date, description, amount, category, vat_inclusive, supplier, receipt_url, notes) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.property_id || null, body.date, body.description, body.amount, body.category || null, body.vat_inclusive !== undefined ? (body.vat_inclusive ? 1 : 0) : 1, body.supplier || null, body.receipt_url || null, body.notes || null).run()
  logActivity(c, 'create', 'petty-cash-expense', id, body.description)
  return c.json({ id }, 201)
})

app.delete('/api/petty-cash/expenses/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM petty_cash_expenses WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'petty-cash-expense', id, '')
  return c.json({ ok: true })
})

// ── Monthly P/L Actuals (from spreadsheet import) ──────
app.get('/api/pl-monthly', async (c) => {
  const pid = c.req.query('property_id')
  const year = c.req.query('year') || String(new Date().getFullYear())
  const clause = pid && pid !== 'all' ? 'WHERE property_id = ? AND year = ?' : 'WHERE year = ?'
  const params: any[] = pid && pid !== 'all' ? [pid, year] : [year]
  const { results } = await c.env.DB.prepare(
    'SELECT id, property_id, month, category_key, amount FROM pl_monthly ' + clause + ' ORDER BY property_id, month, category_key'
  ).bind(...params).all()
  return c.json(results)
})

app.put('/api/pl-monthly/:id', async (c) => {
  const id = c.req.param('id')
  const { amount } = await c.req.json()
  await c.env.DB.prepare('UPDATE pl_monthly SET amount = ? WHERE id = ?').bind(amount, id).run()
  return c.json({ ok: true })
})

app.post('/api/pl-monthly', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO pl_monthly (id, property_id, year, month, category_key, amount) VALUES (?,?,?,?,?,?)'
  ).bind(id, body.property_id || null, body.year, body.month, body.category_key, body.amount || 0).run()
  return c.json({ id }, 201)
})

// ── P/L Entries (manual additions) ──────────────────────
app.get('/api/pl-entries', async (c) => {
  const pid = c.req.query('property_id')
  const year = c.req.query('year') || String(new Date().getFullYear())
  const clause = pid && pid !== 'all' ? 'WHERE property_id = ? AND year = ?' : 'WHERE year = ?'
  const params: any[] = pid && pid !== 'all' ? [pid, year] : [year]
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM pl_entries ' + clause + ' ORDER BY month, category_key, created_at'
  ).bind(...params).all()
  return c.json(results)
})

app.post('/api/pl-entries', async (c) => {
  const body = await c.req.json()
  const id = uuid()
  const { property_id, year, month, category_key, amount, description, deducted_expenses } = body
  if (!year || !month || !category_key || amount == null) return c.json({ error: 'year, month, category_key, amount required' }, 400)
  await c.env.DB.prepare(
    'INSERT INTO pl_entries (id, property_id, year, month, category_key, amount, description, deducted_expenses) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, property_id || null, year, month, category_key, amount, description || '', JSON.stringify(deducted_expenses || [])).run()
  logActivity(c, 'create', 'pl-entry', id, `Added ${category_key} R${Number(amount).toFixed(2)}`)
  return c.json({ id }, 201)
})

app.delete('/api/pl-entries/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM pl_entries WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'pl-entry', id, '')
  return c.json({ ok: true })
})

// ── P/L Data ────────────────────────────────────────────
app.get('/api/pl', async (c) => {
  const pid = c.req.query('property_id')
  const year = c.req.query('year') || String(new Date().getFullYear())
  const clause = pid && pid !== 'all' ? 'WHERE property_id = ? AND year = ?' : 'WHERE year = ?'
  const params: any[] = pid && pid !== 'all' ? [pid, year] : [year]
  const { results } = await c.env.DB.prepare(`SELECT * FROM pl_data ${clause}`).bind(...params).all()
  return c.json(results)
})

app.post('/api/pl', async (c) => {
  const body = await c.req.json()
  const { property_id, year, category, budget_amount, actual_override } = body
  if (!year || !category) return c.json({ error: 'year and category required' }, 400)

  const existing = await c.env.DB.prepare(
    'SELECT id FROM pl_data WHERE property_id IS ? AND year = ? AND category = ?'
  ).bind(property_id || null, year, category).first() as any

  if (existing) {
    const sets: string[] = []
    const vals: any[] = []
    if (budget_amount !== undefined) { sets.push('budget_amount = ?'); vals.push(budget_amount) }
    if (actual_override !== undefined) { sets.push('actual_override = ?'); vals.push(actual_override) }
    sets.push("updated_at = datetime('now')")
    if (sets.length) {
      vals.push(existing.id)
      await c.env.DB.prepare(`UPDATE pl_data SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
    }
  } else {
    const id = uuid()
    await c.env.DB.prepare(
      'INSERT INTO pl_data (id, property_id, year, category, budget_amount, actual_override) VALUES (?,?,?,?,?,?)'
    ).bind(id, property_id || null, year, category, budget_amount ?? null, actual_override ?? null).run()
  }
  return c.json({ ok: true })
})

// ── Debriefs ────────────────────────────────────────────
app.get('/api/debriefs', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM debriefs ORDER BY created_at DESC').all()
  return c.json(results)
})

app.post('/api/debriefs', async (c) => {
  const { title, content } = await c.req.json()
  if (!title) return c.json({ error: 'title is required' }, 400)
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO debriefs (id, title, content) VALUES (?,?,?)'
  ).bind(id, title, content || '').run()
  const row = await c.env.DB.prepare('SELECT * FROM debriefs WHERE id = ?').bind(id).first()
  logActivity(c, 'create', 'debrief', id, title)
  return c.json(row, 201)
})

app.put('/api/debriefs/:id', async (c) => {
  const id = c.req.param('id')
  const { title, content } = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  if (title !== undefined) { sets.push('title = ?'); params.push(title) }
  if (content !== undefined) { sets.push('content = ?'); params.push(content) }
  if (sets.length) {
    sets.push("updated_at = datetime('now')")
    params.push(id)
    await c.env.DB.prepare(`UPDATE debriefs SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  }
  logActivity(c, 'update', 'debrief', id, title || '')
  return c.json({ ok: true })
})

app.delete('/api/debriefs/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM debriefs WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'debrief', id, '')
  return c.json({ ok: true })
})

// ── Tasks ───────────────────────────────────────────────
app.get('/api/tasks', async (c) => {
  const status = c.req.query('status')
  let q = 'SELECT * FROM tasks'
  const params: any[] = []
  if (status && status !== 'all') { q += ' WHERE status = ?'; params.push(status) }
  q += ' ORDER BY created_at DESC'
  const { results } = await c.env.DB.prepare(q).bind(...params).all()
  return c.json(results)
})

app.post('/api/tasks', async (c) => {
  const { title, description, priority, due_date } = await c.req.json()
  if (!title) return c.json({ error: 'title is required' }, 400)
  const id = uuid()
  await c.env.DB.prepare(
    'INSERT INTO tasks (id, title, description, priority, due_date) VALUES (?,?,?,?,?)'
  ).bind(id, title, description || '', priority || 'medium', due_date || null).run()
  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first()
  logActivity(c, 'create', 'task', id, title)
  return c.json(row, 201)
})

app.put('/api/tasks/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const sets: string[] = []
  const params: any[] = []
  for (const k of ['title', 'description', 'status', 'priority', 'due_date'] as const) {
    if (k in body) { sets.push(`${k} = ?`); params.push((body as any)[k]) }
  }
  if (sets.length) {
    sets.push("updated_at = datetime('now')")
    params.push(id)
    await c.env.DB.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  }
  logActivity(c, 'update', 'task', id, body.title)
  return c.json({ ok: true })
})

app.delete('/api/tasks/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run()
  logActivity(c, 'delete', 'task', id, '')
  return c.json({ ok: true })
})

// ── Not found ───────────────────────────────────────────
app.notFound((c) => c.json({ error: 'not found' }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'internal error' }, 500)
})

// ── Import Endpoints ───────────────────────────────────────
app.post('/api/import/preview', async (c) => {
  // This endpoint would typically do some validation or transformation
  // For now, we'll just echo back the data since preview is done client-side
  const body = await c.req.json()
  return c.json({ 
    received: body.entries?.length || 0,
    message: 'Preview data received' 
  })
})

app.post('/api/import/execute', async (c) => {
  const body = await c.req.json()
  const { ledger_type, entries } = body
  
  // Validate ledger_type
  const validLedgers = ['rental_ledger', 'levy_ledger', 'municipality_ledger', 'bank_ledger']
  if (!ledger_type || !validLedgers.includes(ledger_type)) {
    return c.json({ error: 'Invalid ledger type' }, 400)
  }
  
  if (!Array.isArray(entries) || entries.length === 0) {
    return c.json({ inserted: 0, skippedExact: 0, skippedSmart: 0, omitted: [] })
  }
  
  // Process each entry
  const insertedEntries = []
  const skippedExact = []
  const skippedSmart = []
  const omitted = []
  
  for (const entry of entries) {
    try {
      // Validate required fields
      if (!entry.date || !entry.description) {
        omitted.push({ ...entry, reason: 'Missing required fields (date or description)' })
        continue
      }
      
      // Check for exact duplicates (all fields match)
      const exactCheck = await c.env.DB.prepare(
        `SELECT id FROM ${ledger_type} 
         WHERE property_id = ? AND date = ? AND description = ? 
         AND debit = ? AND credit = ? AND balance = ? AND category = ?`
      ).bind(
        entry.property_id || null,
        entry.date,
        entry.description,
        entry.debit || 0,
        entry.credit || 0,
        entry.balance || 0,
        entry.category || null
      ).first()
      
      if (exactCheck) {
        skippedExact.push({ ...entry, reason: 'Exact duplicate found' })
        continue
      }
      
      // Check for smart duplicates (key fields: property_id + date + description + amount)
      // Amount is calculated as credit - debit (net change)
      const netAmount = (entry.credit || 0) - (entry.debit || 0)
      const smartCheck = await c.env.DB.prepare(
        `SELECT id FROM ${ledger_type} 
         WHERE property_id = ? AND date = ? AND description = ? 
         AND (credit - debit) = ?`
      ).bind(
        entry.property_id || null,
        entry.date,
        entry.description,
        netAmount
      ).first()
      
      if (smartCheck) {
        // Get the matching record to show in omitted view
        const matchRecord = await c.env.DB.prepare(
          `SELECT * FROM ${ledger_type} 
           WHERE property_id = ? AND date = ? AND description = ? 
           AND (credit - debit) = ?`
        ).bind(
          entry.property_id || null,
          entry.date,
          entry.description,
          netAmount
        ).first()
        
        skippedSmart.push({ ...entry, reason: 'Smart duplicate found' })
        omitted.push({
          ...entry,
          matched_record: matchRecord,
          reason: 'Smart duplicate (same date, description, and net amount)'
        })
        continue
      }
      
      // No duplicate found, insert the record
      try {
        await c.env.DB.prepare(
          `INSERT INTO ${ledger_type} 
           (id, property_id, date, description, debit, credit, balance, reference, category, imported_at) 
           VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`
        ).bind(
          crypto.randomUUID(),
          entry.property_id || null,
          entry.date,
          entry.description,
          entry.debit || 0,
          entry.credit || 0,
          entry.balance || 0,
          entry.reference || null,
          entry.category || null
        ).run()
        
        insertedEntries.push(entry)
      } catch (insertError) {
        omitted.push({ ...entry, reason: 'Insert failed: ' + String(insertError) })
      }
    } catch (error) {
      console.error('Import error:', error)
      omitted.push({ ...entry, reason: 'Processing error: ' + String(error) })
    }
  }
  
  return c.json({ 
    inserted: insertedEntries.length,
    skippedExact: skippedExact.length,
    skippedSmart: skippedSmart.length,
    omitted: omitted
  })
})

// ── Activity Log ──────────────────────────────────────────
async function logActivity(c: any, action: string, entityType: string, entityId: string | null, entityLabel: string, details?: string) {
  try {
    const auth = c.req.header('Authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    await c.env.DB.prepare(
      'INSERT INTO activity_log (id, actor, action, entity_type, entity_id, entity_label, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(uuid(), token, action, entityType, entityId, entityLabel, details || '').run()
  } catch (e) { console.error('logActivity error:', e) }
}

app.get('/api/activity', async (c) => {
  const { limit = '50', offset = '0' } = c.req.query()
  const rows = await c.env.DB.prepare(
    'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(parseInt(limit), parseInt(offset)).all()
  const count = await c.env.DB.prepare('SELECT COUNT(*) as total FROM activity_log').all()
  return c.json({ results: rows.results, total: count.results?.[0]?.total || 0 })
})

app.delete('/api/activity', async (c) => {
  await c.env.DB.prepare('DELETE FROM activity_log').run()
  return c.json({ ok: true })
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx)
    }
    const res = await env.ASSETS.fetch(request)
    if (res.status === 404 && !url.pathname.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/', url), request))
    }
    return res
  },
} as ExportedHandler<Env>
