// Batch migration: dump old DB data to SQL file, then execute in one shot
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'
import { writeFileSync } from 'fs'

const OLD = 'binos'
const NEW = 'pomp'
const WORKDIR = '/Users/m1nni3/Documents/pmos/apps/pomp'
const TRUST_PROPS = ['Oakdale', 'Malindi', 'Indaba', 'Villeroy']
const ALL_PROPS = ['Oakdale', 'Malindi', 'Indaba', 'Villeroy', 'River Hamlet', 'Trust', 'Unknown']

function q(db, sql) {
  const out = execSync(`npx wrangler d1 execute ${db} --remote --json --command "${sql.replace(/"/g, '\\"')}"`, { cwd: WORKDIR, encoding: 'utf-8', timeout: 30000 })
  return JSON.parse(out)?.flatMap(r => r?.results || []) || []
}

function esc(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return v
  const s = String(v).replace(/'/g, "''")
  return s ? `'${s.slice(0, 1000)}'` : 'NULL'
}

let sql = `-- POMP migration from BINOS\n-- Generated ${new Date().toISOString()}\n\n`

let count = 0

function add(table, cols, vals) {
  sql += `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.map(esc).join(', ')});\n`
  count++
}

console.log('Generating migration SQL...')

// 1. Properties
const props = q(OLD, 'SELECT * FROM properties').filter(p => ALL_PROPS.includes(p.name))
for (const p of props) {
  add('properties', ['id', 'name', 'address', 'scheme_name', 'unit_count'], [p.id, p.name, p.address, p.scheme_name, p.unit_count || 1])
}
console.log(`  ${props.length} properties`)

// 2. Property details
const propIds = props.map(p => p.id)
for (const pid of propIds) {
  const d = q(OLD, `SELECT * FROM property_details WHERE property_id = '${pid}'`)[0]
  if (d) add('property_details', ['id', 'property_id', 'unit_number', 'erf_number', 'suburb', 'purchase_price', 'current_market_value', 'municipal_account_number', 'owner_name', 'tenant_name', 'bc_name', 'bond_bank', 'original_bond_amount', 'monthly_bond_payment'],
    [randomUUID(), pid, d.unit_number, d.erf_number, d.suburb, d.purchase_price, d.current_market_value, d.municipal_account_number, d.owner_name, d.tenant_name, d.bc_name, d.bond_bank, d.original_bond_amount, d.monthly_bond_payment])
}

// 3. Ledgers
for (const table of ['rental_ledger', 'levy_ledger', 'bank_ledger']) {
  const total = q(OLD, `SELECT id, property_id, date, description, debit, credit, balance, reference, category FROM ${table}`)
  for (const e of total) {
    add(table, ['id', 'property_id', 'date', 'description', 'debit', 'credit', 'balance', 'reference', 'category'],
      [randomUUID(), e.property_id, e.date, e.description, e.debit, e.credit, e.balance, e.reference, e.category])
  }
  console.log(`  ${total.length} ${table}`)
}

// 4. Contacts
const contacts = q(OLD, 'SELECT * FROM contacts')
for (const c of contacts) {
  add('contacts', ['id', 'role', 'name', 'email', 'phone', 'address', 'account_number', 'notes'],
    [c.id, c.role, c.name, c.email, c.phone, c.address, c.account_number, c.notes])
}
console.log(`  ${contacts.length} contacts`)

// 5. Work orders
const orders = q(OLD, `SELECT * FROM work_orders`)
for (const o of orders) {
  add('work_orders', ['id', 'property_id', 'unit_id', 'contractor_id', 'description', 'status', 'urgency', 'cost_estimate', 'actual_cost', 'receipt_received', 'raised_at', 'completed_at'],
    [o.id, o.property_id, o.unit_id, o.contractor_id, o.description, o.status || 'open', o.urgency || 'routine', o.cost_estimate, o.actual_cost, o.receipt_received || 0, o.raised_at, o.completed_at])
}
console.log(`  ${orders.length} work orders`)

// 6. Insurance
const policies = q(OLD, `SELECT * FROM insurance_policies`)
for (const p of policies) {
  add('insurance_policies', ['id', 'property_id', 'insurer', 'broker', 'policy_number', 'policy_holder', 'coverage_amount', 'excess', 'premium', 'renewal_date', 'status', 'notes'],
    [p.id, p.property_id, p.insurer, p.broker, p.policy_number, p.policy_holder, p.coverage_amount, p.excess, p.premium, p.renewal_date, p.status || 'active', p.notes])
}
console.log(`  ${policies.length} insurance policies`)

// 7. Bonds
const bonds = q(OLD, `SELECT * FROM bonds`)
for (const b of bonds) {
  add('bonds', ['id', 'property_id', 'bank', 'account_number', 'original_amount', 'monthly_payment', 'expected_payoff_date', 'payment_method'],
    [b.id, b.property_id, b.bank, b.account_number, b.original_amount, b.monthly_payment, b.expected_payoff_date, b.payment_method])
}
console.log(`  ${bonds.length} bonds`)

// 8. Units
const units = q(OLD, `SELECT * FROM units`)
for (const u of units) {
  add('units', ['id', 'property_id', 'unit_number', 'tenant_name', 'monthly_rental', 'deposit', 'lease_start', 'lease_end', 'status'],
    [u.id, u.property_id, u.unit_number, u.tenant_name, u.monthly_rental, u.deposit, u.lease_start, u.lease_end, u.status || 'vacant'])
}
console.log(`  ${units.length} units`)

// 9. Municipality ledger
const mun = q(OLD, `SELECT * FROM municipality_ledger`)
for (const m of mun) {
  add('municipality_ledger', ['id', 'property_id', 'date', 'description', 'debit', 'credit', 'balance', 'reference', 'category'],
    [randomUUID(), m.property_id, m.date, m.description, m.debit, m.credit, m.balance, m.reference, m.category])
}
console.log(`  ${mun.length} municipality entries`)

// Write SQL file
const outPath = `${WORKDIR}/migrations/migrate_from_binos.sql`
writeFileSync(outPath, sql, 'utf-8')
console.log(`\n✓ SQL file written: ${outPath}`)
console.log(`  ${count} total statements`)
console.log('\nNow run: npx wrangler d1 execute pomp --remote --file=migrations/migrate_from_binos.sql')
