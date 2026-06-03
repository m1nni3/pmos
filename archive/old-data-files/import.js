// Import script: parses CSV files and POSTs to Worker API ledger endpoint
// Dedup is handled by UNIQUE index on (date, description, debit, credit, balance)
// Usage: node scripts/import/import.js

const fs = require('fs')
const path = require('path')

const API = 'https://pmos-api.binos-opms.workers.dev/api'

// Property IDs
const PROPERTIES = {
  MALINDI: 'p1000000-0000-0000-0000-000000000002',
  INDABA: 'p1000000-0000-0000-0000-000000000003',
}

function parseSouthAfricanNumber(s) {
  if (!s || !s.trim()) return 0
  s = s.trim().replace(/[R\s]/g, '').replace(',', '.').replace(/\(/g, '-').replace(/\)/g, '')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

function parseDate(d) {
  // Handle multiple formats: DD/MM/YY, DD/MM/YYYY, Mon YYYY
  if (!d) return null
  d = d.trim()
  // "Month YYYY" format e.g. "Feb 2023"
  const monthMap = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'}
  const monMatch = d.match(/^([A-Za-z]{3})\s+(\d{4})$/)
  if (monMatch) {
    return `${monMatch[2]}-${monthMap[monMatch[1].toLowerCase()]}-01`
  }
  // DD/MM/YY or DD/MM/YYYY
  const parts = d.split('/')
  if (parts.length === 3) {
    let y = parts[2]
    if (y.length === 2) y = '20' + y
    return `${y}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
  }
  return d
}

// ─── Parser for Indaba 2024-2025 Owner Statement CSV ───
function parseIndabaCSV(filepath) {
  const text = fs.readFileSync(filepath, 'utf-8').trim()
  const lines = text.split('\n')
  const header = lines[0].split(',').map(h => h.trim())
  const entries = []
  const seen = new Set()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    // Handle quoted fields with commas inside: split smartly
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
    const vals = parts.map(p => p.replace(/^"|"$/g, '').trim())
    if (vals.length < 7) continue

    const [dateStr, desc, amountStr, balanceStr, category, propId, control] = vals
    if (category === 'Category' || !dateStr) continue

    const amount = parseSouthAfricanNumber(amountStr)
    const balance = parseSouthAfricanNumber(balanceStr)
    const debit = amount < 0 ? Math.abs(amount) : 0
    const credit = amount > 0 ? amount : 0
    const date = parseDate(dateStr)
    if (!date) continue

    const key = `${date}|${desc}|${debit}|${credit}|${balance}`
    if (seen.has(key)) {
      console.log(`  [SKIP DUP] ${date} ${desc} D${debit} C${credit} B${balance}`)
      continue
    }
    seen.add(key)

    entries.push({
      property_id: PROPERTIES.INDABA,
      date,
      description: desc,
      debit: Math.round(debit * 100) / 100,
      credit: Math.round(credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      reference: category,
    })
  }
  return entries
}

// ─── Parser for Malindi Levy Statement CSV (2024-2026) ───
function parseMalindiLevyCSV(filepath) {
  const text = fs.readFileSync(filepath, 'utf-8').trim()
  const lines = text.split('\n')
  const entries = []
  const seen = new Set()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    if (cols.length < 6) continue

    const [dateStr, ref, desc, debitStr, creditStr, balanceStr, dc] = cols
    if (!dateStr || desc === 'DESCRIPTION' || desc === 'Take-on Balances') continue

    const debit = parseSouthAfricanNumber(debitStr)
    const credit = parseSouthAfricanNumber(creditStr)
    const balance = parseSouthAfricanNumber(balanceStr)
    const date = parseDate(dateStr)
    if (!date) continue

    const key = `${date}|${desc}|${debit}|${credit}|${balance}`
    if (seen.has(key)) {
      console.log(`  [SKIP DUP] ${date} ${desc} D${debit} C${credit} B${balance}`)
      continue
    }
    seen.add(key)

    entries.push({
      property_id: PROPERTIES.MALINDI,
      date,
      description: desc.trim(),
      debit: Math.round(debit * 100) / 100,
      credit: Math.round(credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      reference: ref ? ref.trim() : null,
    })
  }
  return entries
}

// ─── Parser for Malindi Owner Ledger (semicolon-delimited Kemprent format) ───
function parseMalindiOwnerLedger(text) {
  const lines = text.split('\n')
  const entries = []
  const seen = new Set()
  let currentSection = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Skip headers, footers, and non-data lines
    if (line.startsWith(';') || line.startsWith('KEMPRENT') || line.startsWith('Supplier Detailed Ledger') ||
        line.startsWith('3525DI') || line.startsWith('-------------------------------') ||
        line.startsWith('Prepared by') || line.startsWith('Opening Balance') ||
        line.startsWith('Closing Balance') || line.startsWith('TOTAL CLOSING') ||
        line.match(/^;\d+DI/) || line.match(/^Page:/) || line.match(/^;;;/) ||
        line === ';;;;;;;' || line.startsWith(';;;;;')) continue

    // Split by semicolons
    const parts = line.split(';')
    if (parts.length < 8) continue

    const dateStr = (parts[0] || '').trim()
    const entryType = (parts[1] || '').trim()
    const reference = (parts[2] || '').trim()
    const contraAcc = (parts[3] || '').trim()
    const description = (parts[4] || '').trim()
    const debitStr = (parts[5] || '').trim()
    const creditStr = (parts[6] || '').trim()
    const cumulativeStr = (parts[7] || '').trim()

    // Skip if not a date row
    if (!dateStr.match(/^\d{2}\/\d{2}\/\d{2}$/)) continue
    if (!entryType || entryType === '') continue

    const date = parseDate(dateStr)
    if (!date) continue

    const debit = parseSouthAfricanNumber(debitStr)
    const credit = parseSouthAfricanNumber(creditStr)
    const balance = parseSouthAfricanNumber(cumulativeStr.replace(/^;/, ''))

    const desc = entryType === 'Rent Owner' ? `Rent Malindi D26` :
                 entryType === 'Commission 10% + VAT' ? `Commission 10% + VAT` :
                 entryType === 'Levy' ? `Levy` :
                 entryType === 'Levy Admin' ? `Levy Admin` :
                 entryType === 'Absa Pay' ? `Absa Pay ${reference}` :
                 entryType === 'General Journal' ? description || `GJ ${reference}` :
                 description || entryType

    const key = `${date}|${desc}|${debit}|${credit}|${balance}`
    if (seen.has(key)) {
      console.log(`  [SKIP DUP] ${date} ${desc} D${debit} C${credit} B${balance}`)
      continue
    }
    seen.add(key)

    entries.push({
      property_id: PROPERTIES.MALINDI,
      date,
      description: desc,
      debit: Math.round(debit * 100) / 100,
      credit: Math.round(credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      reference: reference || null,
    })
  }
  return entries
}

// ─── Parser for Trust Account Summary (P272D) ───
function parseTrustAccountCSV(filepath) {
  const text = fs.readFileSync(filepath, 'utf-8').trim()
  const lines = text.split('\n')
  const entries = []
  const seen = new Set()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Split respecting quoted fields and preserving empty values
    const vals = []
    let current = ''
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; continue }
      current += ch
    }
    vals.push(current.trim())

    if (vals.length < 6) continue
    const [dateStr, desc, glAlloc, expenseStr, incomeStr, balanceStr] = vals
    if (!dateStr || desc === 'Description' || desc === '') continue

    const expense = parseFloat(expenseStr) || 0
    const income = parseFloat(incomeStr) || 0
    // In trust CSV: Expense is negative for payments out, Income is positive for receipts in
    const debit = expense < 0 ? Math.abs(expense) : 0
    const credit = income > 0 ? income : 0

    const balance = parseFloat(balanceStr) || 0
    const date = parseDate(dateStr)
    if (!date) continue

    const key = `${date}|${desc}|${debit}|${credit}|${balance}`
    if (seen.has(key)) {
      console.log(`  [SKIP DUP] ${date} ${desc} D${debit} C${credit} B${balance}`)
      continue
    }
    seen.add(key)

    entries.push({
      property_id: PROPERTIES.MALINDI,
      date,
      description: desc,
      debit: Math.round(debit * 100) / 100,
      credit: Math.round(credit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      reference: glAlloc || null,
    })
  }
  return entries
}

// ─── Batch POST to API ───
async function postEntries(source, table, entries, batchSize = 100) {
  console.log(`\n=== Importing ${entries.length} entries to ${table} from ${source} ===`)
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    try {
      const res = await fetch(`${API}/ledger/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      const result = await res.json()
      inserted += result.inserted || 0
      skipped += result.skipped || 0
      process.stdout.write(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}: ${result.inserted} inserted, ${result.skipped} skipped\n`)
    } catch (err) {
      console.error(`  Batch failed:`, err.message)
    }
  }
  console.log(`  Total: ${inserted} inserted, ${skipped} skipped (${inserted + skipped} attempted)`)
}

// ─── Main ───
async function main() {
  const scriptDir = __dirname

  // 1. Import Indaba owner statement → rental_ledger
  const indabaFile = path.join(scriptDir, 'Indaba 2024-2025 Owner Statement.csv')
  if (fs.existsSync(indabaFile)) {
    const indabaEntries = parseIndabaCSV(indabaFile)
    await postEntries('Indaba Owner Statement', 'rental_ledger', indabaEntries)
  }

  // 2. Import Malindi levy statement → levy_ledger
  const malindiLevyFile = path.join(scriptDir, 'Malindi 2024-2026.csv')
  if (fs.existsSync(malindiLevyFile)) {
    const malindiLevyEntries = parseMalindiLevyCSV(malindiLevyFile)
    await postEntries('Malindi Levy Statement', 'levy_ledger', malindiLevyEntries)
  }

  // 3. Import Malindi owner ledger (Kemprent format) → rental_ledger
  const malindiOwnerFile = path.join(scriptDir, 'Malindi_D26_Master_Owner_Ledger_COMPLETE_regenerated (1).csv')
  if (fs.existsSync(malindiOwnerFile)) {
    const text = fs.readFileSync(malindiOwnerFile, 'utf-8')
    const malindiOwnerEntries = parseMalindiOwnerLedger(text)
    await postEntries('Malindi Owner Ledger (Kemprent)', 'rental_ledger', malindiOwnerEntries)
  }

  // 4. Import Trust Account Summary → bank_ledger
  const trustFile = path.join(scriptDir, 'P272D_trust_account_summary.csv')
  if (fs.existsSync(trustFile)) {
    const trustEntries = parseTrustAccountCSV(trustFile)
    await postEntries('P272D Trust Account', 'bank_ledger', trustEntries)
  }

  console.log('\n=== Import Complete ===')
}

main().catch(console.error)
