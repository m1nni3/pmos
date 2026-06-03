const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const SCHEMA = {
  "properties": [
    { "name": "id", "type": "TEXT PK", "description": "Unique property identifier" },
    { "name": "name", "type": "TEXT", "description": "Property display name" },
    { "name": "address", "type": "TEXT", "description": "Physical street address" },
    { "name": "scheme_name", "type": "TEXT", "description": "Sectional title scheme name" },
    { "name": "unit_count", "type": "INTEGER", "description": "Number of units" },
    { "name": "created_at", "type": "TEXT", "description": "Record creation timestamp" },
    { "name": "updated_at", "type": "TEXT", "description": "Last update timestamp" }
  ],
  "property_details": [
    { "name": "id", "type": "TEXT PK", "description": "Unique detail record identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "unit_number", "type": "TEXT", "description": "Unit number within scheme" },
    { "name": "door_number", "type": "TEXT", "description": "Door or street number" },
    { "name": "erf_number", "type": "TEXT", "description": "Erf (land parcel) number" },
    { "name": "scheme_number", "type": "TEXT", "description": "Sectional title registration number" },
    { "name": "size_sqm", "type": "REAL", "description": "Floor area in square meters" },
    { "name": "bedrooms", "type": "INTEGER", "description": "Number of bedrooms" },
    { "name": "bathrooms", "type": "INTEGER", "description": "Number of bathrooms" },
    { "name": "parking_bays", "type": "INTEGER", "description": "Number of parking bays" },
    { "name": "suburb", "type": "TEXT", "description": "Suburb or neighbourhood" },
    { "name": "township", "type": "TEXT", "description": "Township or city" },
    { "name": "lpi_code", "type": "TEXT", "description": "Land Parcel Identifier code" },
    { "name": "purchase_date", "type": "TEXT", "description": "Date property was purchased" },
    { "name": "purchase_price", "type": "REAL", "description": "Original purchase price" },
    { "name": "current_market_value", "type": "REAL", "description": "Estimated current market value" },
    { "name": "title_deed_reference", "type": "TEXT", "description": "Title deed reference number" },
    { "name": "owner_name", "type": "TEXT", "description": "Registered owner name" },
    { "name": "owner_id", "type": "TEXT", "description": "Owner identification number" },
    { "name": "registered_owner", "type": "TEXT", "description": "Legal entity registered as owner" },
    { "name": "municipality_name", "type": "TEXT", "description": "Local municipality name" },
    { "name": "municipal_valuation", "type": "TEXT", "description": "Municipal property valuation" },
    { "name": "municipal_valuation_year", "type": "TEXT", "description": "Year of municipal valuation" },
    { "name": "municipal_account_number", "type": "TEXT", "description": "Municipal account number" },
    { "name": "municipal_paid_by", "type": "TEXT", "description": "Who pays municipal bills" },
    { "name": "agency", "type": "TEXT", "description": "Managing agency name" },
    { "name": "managing_agent_name", "type": "TEXT", "description": "Managing agent or company" },
    { "name": "portfolio_manager", "type": "TEXT", "description": "Portfolio manager name" },
    { "name": "agent_email", "type": "TEXT", "description": "Managing agent email" },
    { "name": "agent_phone", "type": "TEXT", "description": "Managing agent phone" },
    { "name": "account_administrator", "type": "TEXT", "description": "Account administrator name" },
    { "name": "maintenance_manager", "type": "TEXT", "description": "Maintenance manager name" },
    { "name": "department_head", "type": "TEXT", "description": "Department head name" },
    { "name": "management_fee", "type": "TEXT", "description": "Management fee arrangement" },
    { "name": "payment_method", "type": "TEXT", "description": "Payment method" },
    { "name": "branch", "type": "TEXT", "description": "Agency branch name" },
    { "name": "branch_code", "type": "TEXT", "description": "Agency branch code" },
    { "name": "tenant_name", "type": "TEXT", "description": "Current tenant name" },
    { "name": "tenant_phone", "type": "TEXT", "description": "Current tenant phone" },
    { "name": "tenant_email", "type": "TEXT", "description": "Current tenant email" },
    { "name": "tenant_notes", "type": "TEXT", "description": "Tenant notes" },
    { "name": "bc_name", "type": "TEXT", "description": "Body corporate name" },
    { "name": "bc_registration_number", "type": "TEXT", "description": "BC registration number" },
    { "name": "bc_bank", "type": "TEXT", "description": "BC bank name" },
    { "name": "bc_account_name", "type": "TEXT", "description": "BC bank account name" },
    { "name": "bc_branch", "type": "TEXT", "description": "BC bank branch" },
    { "name": "bc_branch_code", "type": "TEXT", "description": "BC branch code" },
    { "name": "bc_levy_reference", "type": "TEXT", "description": "BC levy reference" },
    { "name": "bc_levy_payment_method", "type": "TEXT", "description": "BC levy payment method" },
    { "name": "bc_contact_name", "type": "TEXT", "description": "BC contact person" },
    { "name": "bc_contact_phone", "type": "TEXT", "description": "BC contact phone" },
    { "name": "bc_contact_email", "type": "TEXT", "description": "BC contact email" },
    { "name": "bond_bank", "type": "TEXT", "description": "Bond bank name" },
    { "name": "bond_account_number", "type": "TEXT", "description": "Bond account number" },
    { "name": "original_bond_amount", "type": "REAL", "description": "Original bond amount" },
    { "name": "monthly_bond_payment", "type": "REAL", "description": "Monthly bond repayment" },
    { "name": "expected_payoff_date", "type": "TEXT", "description": "Expected bond payoff date" },
    { "name": "insurer", "type": "TEXT", "description": "Insurance company" },
    { "name": "broker", "type": "TEXT", "description": "Insurance broker" },
    { "name": "policy_number", "type": "TEXT", "description": "Insurance policy number" },
    { "name": "policy_holder", "type": "TEXT", "description": "Named insured" },
    { "name": "geyser_excess", "type": "REAL", "description": "Geyser insurance excess" },
    { "name": "annual_renewal_date", "type": "TEXT", "description": "Insurance renewal date" },
    { "name": "insurance_contact", "type": "TEXT", "description": "Insurance contact" },
    { "name": "emergency_contact_name", "type": "TEXT", "description": "Emergency contact name" },
    { "name": "emergency_contact_phone", "type": "TEXT", "description": "Emergency contact phone" },
    { "name": "emergency_contact_email", "type": "TEXT", "description": "Emergency contact email" },
    { "name": "emergency_contact_notes", "type": "TEXT", "description": "Emergency contact notes" }
  ],
  "units": [
    { "name": "id", "type": "TEXT PK", "description": "Unique unit identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "unit_number", "type": "TEXT", "description": "Unit number" },
    { "name": "tenant_name", "type": "TEXT", "description": "Current tenant name" },
    { "name": "tenant_phone", "type": "TEXT", "description": "Tenant phone" },
    { "name": "tenant_email", "type": "TEXT", "description": "Tenant email" },
    { "name": "monthly_rental", "type": "REAL", "description": "Monthly rental amount" },
    { "name": "deposit", "type": "REAL", "description": "Rental deposit held" },
    { "name": "lease_start", "type": "TEXT", "description": "Lease start date" },
    { "name": "lease_end", "type": "TEXT", "description": "Lease end date" },
    { "name": "status", "type": "TEXT", "description": "Occupancy status" }
  ],
  "rental_ledger": [
    { "name": "id", "type": "TEXT PK", "description": "Unique ledger entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Transaction description" },
    { "name": "debit", "type": "REAL", "description": "Debit amount (money owed)" },
    { "name": "credit", "type": "REAL", "description": "Credit amount (money received)" },
    { "name": "balance", "type": "REAL", "description": "Running balance" },
    { "name": "reference", "type": "TEXT", "description": "External reference number" },
    { "name": "category", "type": "REF(Categories)", "description": "Transaction category (dropdown)" },
    { "name": "imported_at", "type": "TEXT", "description": "Import timestamp" }
  ],
  "levy_ledger": [
    { "name": "id", "type": "TEXT PK", "description": "Unique levy entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Transaction description" },
    { "name": "debit", "type": "REAL", "description": "Debit amount (charges)" },
    { "name": "credit", "type": "REAL", "description": "Credit amount (payments)" },
    { "name": "balance", "type": "REAL", "description": "Running balance" },
    { "name": "reference", "type": "TEXT", "description": "External reference number" },
    { "name": "category", "type": "REF(Categories)", "description": "Transaction category (dropdown)" },
    { "name": "imported_at", "type": "TEXT", "description": "Import timestamp" }
  ],
  "municipality_ledger": [
    { "name": "id", "type": "TEXT PK", "description": "Unique municipality entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Transaction description" },
    { "name": "debit", "type": "REAL", "description": "Debit amount (charges)" },
    { "name": "credit", "type": "REAL", "description": "Credit amount (payments)" },
    { "name": "balance", "type": "REAL", "description": "Running balance" },
    { "name": "reference", "type": "TEXT", "description": "External reference number" },
    { "name": "category", "type": "REF(Categories)", "description": "Transaction category (dropdown)" },
    { "name": "imported_at", "type": "TEXT", "description": "Import timestamp" }
  ],
  "bank_ledger": [
    { "name": "id", "type": "TEXT PK", "description": "Unique bank entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Transaction description" },
    { "name": "debit", "type": "REAL", "description": "Debit amount (money out)" },
    { "name": "credit", "type": "REAL", "description": "Credit amount (money in)" },
    { "name": "balance", "type": "REAL", "description": "Running balance" },
    { "name": "reference", "type": "TEXT", "description": "Bank reference number" },
    { "name": "category", "type": "REF(Categories)", "description": "Transaction category (dropdown)" },
    { "name": "imported_at", "type": "TEXT", "description": "Import timestamp" }
  ],
  "reconciliation": [
    { "name": "id", "type": "TEXT PK", "description": "Unique reconciliation identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "period", "type": "TEXT", "description": "Period (YYYY-MM)" },
    { "name": "ledger_type", "type": "TEXT", "description": "Ledger type being reconciled" },
    { "name": "ledger_amount", "type": "REAL", "description": "Ledger total amount" },
    { "name": "bank_amount", "type": "REAL", "description": "Bank statement total" },
    { "name": "variance", "type": "REAL", "description": "Difference (bank - ledger)" },
    { "name": "status", "type": "TEXT", "description": "Status: matched, unmatched, exception, pending" },
    { "name": "notes", "type": "TEXT", "description": "Reconciliation notes" },
    { "name": "resolved_at", "type": "TEXT", "description": "Resolution timestamp" }
  ],
  "work_orders": [
    { "name": "id", "type": "TEXT PK", "description": "Unique work order identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "unit_id", "type": "TEXT FK", "description": "References units(id)" },
    { "name": "contractor_id", "type": "TEXT", "description": "Assigned contractor ID" },
    { "name": "description", "type": "TEXT", "description": "Work description" },
    { "name": "status", "type": "TEXT", "description": "Status: open, in_progress, completed, cancelled" },
    { "name": "urgency", "type": "TEXT", "description": "Urgency: routine, urgent, emergency" },
    { "name": "liability", "type": "TEXT", "description": "Cost liable party" },
    { "name": "cost_estimate", "type": "REAL", "description": "Estimated cost" },
    { "name": "actual_cost", "type": "REAL", "description": "Actual cost" },
    { "name": "receipt_received", "type": "INTEGER", "description": "Receipt received flag (0/1)" },
    { "name": "raised_at", "type": "TEXT", "description": "When the order was raised" },
    { "name": "completed_at", "type": "TEXT", "description": "When work was completed" }
  ],
  "contacts": [
    { "name": "id", "type": "TEXT PK", "description": "Unique contact identifier" },
    { "name": "role", "type": "TEXT", "description": "Contact role: managing_agent, letting_agent, municipality, bank, contractor" },
    { "name": "name", "type": "TEXT", "description": "Contact name" },
    { "name": "email", "type": "TEXT", "description": "Email address" },
    { "name": "phone", "type": "TEXT", "description": "Phone number" },
    { "name": "address", "type": "TEXT", "description": "Physical address" },
    { "name": "account_number", "type": "TEXT", "description": "Account number" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "bonds": [
    { "name": "id", "type": "TEXT PK", "description": "Unique bond identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "bank", "type": "TEXT", "description": "Bank name" },
    { "name": "account_number", "type": "TEXT", "description": "Bond account number" },
    { "name": "original_amount", "type": "REAL", "description": "Original loan amount" },
    { "name": "monthly_payment", "type": "REAL", "description": "Monthly repayment" },
    { "name": "expected_payoff_date", "type": "TEXT", "description": "Expected payoff date" },
    { "name": "payment_method", "type": "TEXT", "description": "Payment method" },
    { "name": "provider_name", "type": "TEXT", "description": "Bond provider name" },
    { "name": "provider_phone", "type": "TEXT", "description": "Provider phone" },
    { "name": "provider_email", "type": "TEXT", "description": "Provider email" },
    { "name": "provider_notes", "type": "TEXT", "description": "Provider notes" }
  ],
  "insurance_policies": [
    { "name": "id", "type": "TEXT PK", "description": "Unique policy identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "insurer", "type": "TEXT", "description": "Insurance company" },
    { "name": "broker", "type": "TEXT", "description": "Insurance broker" },
    { "name": "policy_number", "type": "TEXT", "description": "Policy number" },
    { "name": "policy_holder", "type": "TEXT", "description": "Named insured" },
    { "name": "coverage_amount", "type": "REAL", "description": "Coverage amount" },
    { "name": "excess", "type": "REAL", "description": "Excess/deductible" },
    { "name": "premium", "type": "REAL", "description": "Premium amount" },
    { "name": "renewal_date", "type": "TEXT", "description": "Renewal date" },
    { "name": "status", "type": "TEXT", "description": "Status: active, expiring_soon, expired" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "documents": [
    { "name": "id", "type": "TEXT PK", "description": "Unique document identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "name", "type": "TEXT", "description": "Document name" },
    { "name": "category", "type": "REF(Categories)", "description": "Document category (dropdown)" },
    { "name": "file_url", "type": "TEXT", "description": "File URL or path" },
    { "name": "mime_type", "type": "TEXT", "description": "MIME type" },
    { "name": "size_bytes", "type": "INTEGER", "description": "File size in bytes" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" },
    { "name": "expiry_date", "type": "TEXT", "description": "Document expiry date" }
  ],
  "property_history": [
    { "name": "id", "type": "TEXT PK", "description": "Unique history event identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "event_type", "type": "TEXT", "description": "Event type: purchase, inspection, lease, maintenance, valuation, note" },
    { "name": "title", "type": "TEXT", "description": "Event title" },
    { "name": "description", "type": "TEXT", "description": "Event description" },
    { "name": "event_date", "type": "TEXT", "description": "Event date" }
  ],
  "property_contacts": [
    { "name": "id", "type": "TEXT PK", "description": "Unique contact identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "category", "type": "REF(Categories)", "description": "Contact category (dropdown)" },
    { "name": "subcategory", "type": "TEXT", "description": "Subcategory (e.g., plumber, electrician)" },
    { "name": "name", "type": "TEXT", "description": "Contact name" },
    { "name": "phone", "type": "TEXT", "description": "Phone number" },
    { "name": "email", "type": "TEXT", "description": "Email address" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "property_documents": [
    { "name": "id", "type": "TEXT PK", "description": "Unique document identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "name", "type": "TEXT", "description": "Document name" },
    { "name": "category", "type": "REF(Categories)", "description": "Document category (dropdown)" },
    { "name": "file_url", "type": "TEXT", "description": "File URL or path" },
    { "name": "mime_type", "type": "TEXT", "description": "MIME type" },
    { "name": "size_bytes", "type": "INTEGER", "description": "File size in bytes" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "valuation_history": [
    { "name": "id", "type": "TEXT PK", "description": "Unique valuation identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "value", "type": "REAL", "description": "Valuation amount" },
    { "name": "date", "type": "TEXT", "description": "Valuation date" },
    { "name": "source", "type": "TEXT", "description": "Valuation source (municipal, bank, agent)" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "petty_cash_income": [
    { "name": "id", "type": "TEXT PK", "description": "Unique income entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Income description" },
    { "name": "amount", "type": "REAL", "description": "Income amount" },
    { "name": "category", "type": "REF(Categories)", "description": "Income category (dropdown)" },
    { "name": "receipt_url", "type": "TEXT", "description": "Receipt file URL" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "petty_cash_expenses": [
    { "name": "id", "type": "TEXT PK", "description": "Unique expense entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "date", "type": "TEXT", "description": "Transaction date" },
    { "name": "description", "type": "TEXT", "description": "Expense description" },
    { "name": "amount", "type": "REAL", "description": "Expense amount" },
    { "name": "category", "type": "REF(Categories)", "description": "Expense category (dropdown)" },
    { "name": "vat_inclusive", "type": "INTEGER", "description": "Amount includes VAT (0/1)" },
    { "name": "supplier", "type": "TEXT", "description": "Supplier name" },
    { "name": "receipt_url", "type": "TEXT", "description": "Receipt file URL" },
    { "name": "notes", "type": "TEXT", "description": "Additional notes" }
  ],
  "budgets": [
    { "name": "id", "type": "TEXT PK", "description": "Unique budget entry identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id)" },
    { "name": "year", "type": "INTEGER", "description": "Budget year" },
    { "name": "month", "type": "INTEGER", "description": "Budget month (1-12)" },
    { "name": "category", "type": "REF(Categories)", "description": "Budget category (dropdown)" },
    { "name": "budget_amount", "type": "REAL", "description": "Budgeted amount" }
  ],
  "ledger_mapping": [
    { "name": "id", "type": "TEXT PK", "description": "Unique mapping rule identifier" },
    { "name": "property_id", "type": "TEXT FK", "description": "References properties(id); NULL = global" },
    { "name": "ledger_type", "type": "TEXT", "description": "Target ledger type" },
    { "name": "pattern", "type": "TEXT", "description": "SQL LIKE pattern to match" },
    { "name": "category", "type": "REF(Categories)", "description": "Category to assign (dropdown)" },
    { "name": "priority", "type": "INTEGER", "description": "Rule priority (higher = first)" },
    { "name": "is_active", "type": "INTEGER", "description": "Rule active flag (0/1)" }
  ]
}

// Categories for dropdown options
const CATEGORIES = [
  'Rental Income',
  'Levy Income',
  'Levy Payment',
  'Bank Fee',
  'Bank Charge',
  'Municipal Rates',
  'Municipal Charges',
  'Maintenance',
  'Insurance',
  'Utilities',
  'Water',
  'Electricity',
  'Refuse',
  'Security',
  'Repairs',
  'Legal',
  'Lease',
  'Financial',
  'Other',
  'emergency',
  'service_provider',
  'professional'
]

const outputPath = path.join(__dirname, '..', 'binos', 'POMP-Database-Schema.xlsx')
const wb = XLSX.utils.book_new()

// Table order (alphabetical)
const tableOrder = Object.keys(SCHEMA).sort()

tableOrder.forEach(tableName => {
  const cols = SCHEMA[tableName]
  const header = ['Column Name', 'Data Type', 'Description']
  const rows = cols.map(c => [c.name, c.type, c.description])
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, // Column Name
    { wch: 18 }, // Data Type
    { wch: 55 }, // Description
  ]

  // Add dropdown for category columns
  cols.forEach((col, idx) => {
    if (col.type === 'REF(Categories)') {
      const rowStart = 2 // 1 header + 1 first data row
      const rowEnd = rows.length + 1
      const colLetter = XLSX.utils.encode_col(idx)
      // Data validation for dropdown
      if (!ws['!dataValidations']) ws['!dataValidations'] = []
      ws['!dataValidations'].push({
        type: 'list',
        formula1: `Categories!$A$2:$A$${CATEGORIES.length + 1}`,
        ranges: [`${colLetter}${rowStart}:${colLetter}${rowEnd}`]
      })
    }
  })

  XLSX.utils.book_append_sheet(wb, ws, tableName)
})

// Categories sheet (used as dropdown reference)
const catData = [['Category Name'], ...CATEGORIES.map(c => [c])]
const catWs = XLSX.utils.aoa_to_sheet(catData)
catWs['!cols'] = [{ wch: 25 }]
XLSX.utils.book_append_sheet(wb, catWs, 'Categories')

// Legend sheet
const legendData = [
  ['Legend'],
  [''],
  ['Data Type', 'Meaning'],
  ['TEXT', 'Text/string value'],
  ['TEXT PK', 'Primary key (UUID)'],
  ['TEXT FK', 'Foreign key referencing another table'],
  ['INTEGER', 'Whole number'],
  ['REAL', 'Decimal number'],
  ['REF(Categories)', 'Dropdown reference to Categories sheet'],
  [''],
  ['Generated from POMP database schema'],
  [`Date: ${new Date().toISOString().split('T')[0]}`],
]
const legendWs = XLSX.utils.aoa_to_sheet(legendData)
legendWs['!cols'] = [{ wch: 20 }, { wch: 55 }]
XLSX.utils.book_append_sheet(wb, legendWs, 'Legend')

XLSX.writeFile(wb, outputPath)
console.log(`Workbook saved: ${outputPath}`)
console.log(`${tableOrder.length} tables + Categories + Legend sheets`)
