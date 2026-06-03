import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const parentPageId = process.env.PARENT_PAGE_ID

if (!notion.auth || !parentPageId) {
  console.error('Usage: NOTION_API_KEY=ntn_xxx PARENT_PAGE_ID=<page_id> node scripts/setup-notion.mjs')
  process.exit(1)
}

async function createDb(name, properties) {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: name } }],
    properties,
  })
  console.log(`  ✓ ${name}: ${db.id}`)
  return db.id
}

const text = (name) => ({ [name]: { type: 'rich_text', rich_text: {} } })
const number = (name) => ({ [name]: { type: 'number', number: { format: 'number' } } })
const date = (name) => ({ [name]: { type: 'date', date: {} } })
const select = (name, options) => ({ [name]: { type: 'select', select: { options: options.map(o => ({ name: o })) } } })
const email = (name) => ({ [name]: { type: 'email', email: {} } })
const phone = (name) => ({ [name]: { type: 'phone_number', phone_number: {} } })
const url = (name) => ({ [name]: { type: 'url', url: {} } })
const checkbox = (name) => ({ [name]: { type: 'checkbox', checkbox: {} } })
const relation = (name, dbId) => ({ [name]: { type: 'relation', relation: { database_id: dbId, single_property: {} } } })

console.log('Creating Notion databases...\n')

await createDb('Properties', {
  ...text('Name'),
  ...text('Address'),
  ...text('Scheme Name'),
  ...text('Unit Number'),
  ...text('Erf Number'),
  ...number('Valuation'),
  ...date('Valuation Date'),
  ...text('Municipal Account'),
  ...text('LPI Code'),
  ...number('Size Sqm'),
  ...text('Suburb'),
})

await createDb('Ownership', {
  ...text('Owner Name'),
  ...text('Owner ID'),
  ...text('Registered Owner'),
  ...text('Bond Institution'),
  ...text('Bond Account'),
  ...number('Bond Amount'),
  ...number('Monthly Payment'),
  ...date('Payoff Date'),
  ...text('Bank Name'),
  ...text('Bank Account'),
  ...text('Bank Branch'),
  ...text('Branch Code'),
  ...text('Notes'),
})

await createDb('Leases', {
  ...text('Tenant Name'),
  ...date('Lease Start'),
  ...date('Lease End'),
  ...number('Rent Amount'),
  ...number('Escalation Rate'),
  ...date('Escalation Date'),
  ...number('Deposit Amount'),
  ...text('Deposit Held By'),
  ...select('Status', ['Active', 'Expiring Soon', 'Expired', 'Renewing']),
})

await createDb('Tenants', {
  ...text('Full Name'),
  ...text('ID Number'),
  ...email('Email'),
  ...phone('Phone'),
  ...phone('Emergency Phone'),
  ...text('Emergency Contact'),
  ...text('Notes'),
})

await createDb('Letting Agents', {
  ...text('Agency Name'),
  ...text('Registration Number'),
  ...text('Contact Person'),
  ...phone('Phone'),
  ...email('Email'),
  ...text('Physical Address'),
  ...text('Trust Account Name'),
  ...text('Trust Bank'),
  ...text('Trust Branch'),
  ...text('Trust Account Number'),
  ...url('Portal URL'),
  ...text('Portal Login'),
  ...number('Commission Percent'),
})

await createDb('Managing Agents', {
  ...text('Agency Name'),
  ...text('Registration Number'),
  ...text('Contact Person'),
  ...phone('Phone'),
  ...email('Email'),
  ...url('Portal URL'),
  ...text('Portal Login'),
  ...text('Notes'),
})

await createDb('Body Corporates', {
  ...text('Scheme Name'),
  ...text('Registration Number'),
  ...number('Annual Budget'),
  ...date('AGM Date'),
  ...number('Levy Amount'),
  ...select('Levy Frequency', ['Monthly', 'Quarterly']),
  ...number('Reserve Fund'),
  ...text('Insurance Details'),
  ...text('Notes'),
})

await createDb('Letting Agent Ledger', {
  ...date('Date'),
  ...text('Description'),
  ...text('Reference'),
  ...number('Debit'),
  ...number('Credit'),
  ...number('Balance'),
  ...select('Category', ['Rent', 'Rates', 'Levies', 'Maintenance', 'Commission', 'Insurance', 'Other']),
  ...text('Period'),
  ...select('Bank Verified', ['Yes', 'No', 'Pending']),
  ...select('Vendor Verified', ['Yes', 'No', 'Pending']),
})

await createDb('Bank Statements', {
  ...date('Transaction Date'),
  ...date('Value Date'),
  ...text('Description'),
  ...number('Debit'),
  ...number('Credit'),
  ...number('Balance'),
  ...text('Statement Month'),
  ...text('Statement Reference'),
  ...text('Bank Name'),
  ...text('Account Number'),
  ...select('Reconciled', ['Yes', 'No', 'Pending']),
})

await createDb('Vendor Statements', {
  ...text('Vendor Name'),
  ...text('Period'),
  ...date('Date Issued'),
  ...number('Amount Due'),
  ...number('Amount Received'),
  ...date('Date Received'),
  ...text('Reference'),
  ...select('Reconciled', ['Yes', 'No', 'Pending']),
})

await createDb('Reconciliation Items', {
  ...text('Period'),
  ...number('Ledger Amount'),
  ...number('Bank Amount'),
  ...number('Vendor Amount'),
  ...select('Status', ['Matched', 'Discrepancy', 'Missing Source']),
  ...text('Notes'),
  ...date('Resolved Date'),
})

await createDb('Maintenance', {
  ...date('Date Reported'),
  ...text('Description'),
  ...select('Urgency', ['Routine', 'Urgent', 'Emergency']),
  ...select('Liability', ['Trust', 'Body Corp', 'Tenant']),
  ...text('Contractor'),
  ...number('Cost Estimate'),
  ...number('Actual Cost'),
  ...checkbox('Receipt Received'),
  ...select('Status', ['Open', 'In Progress', 'Completed', 'Disputed']),
  ...text('Frequency Notes'),
})

await createDb('Insurance Policies', {
  ...text('Policy Type'),
  ...text('Insurer'),
  ...text('Policy Number'),
  ...text('Broker'),
  ...number('Coverage Amount'),
  ...number('Excess'),
  ...number('Premium'),
  ...date('Renewal Date'),
  ...select('Status', ['Active', 'Expiring Soon', 'Expired', 'Claimed']),
})

await createDb('Documents', {
  ...text('Name'),
  ...select('Type', ['Lease', 'Levy', 'Title Deed', 'Insurance', 'Bank Statement', 'Maintenance', 'Other']),
  ...url('File URL'),
  ...date('Uploaded Date'),
  ...date('Expiry Date'),
  ...text('Notes'),
})

await createDb('Contacts', {
  ...text('Name'),
  ...text('Company'),
  ...select('Role', ['Vendor', 'Contractor', 'Attorney', 'Accountant', 'Bank', 'Insurance Broker', 'Other']),
  ...phone('Phone'),
  ...email('Email'),
  ...text('Address'),
  ...text('Notes'),
})

await createDb('Meetings', {
  ...select('Type', ['AGM', 'Trustee', 'Site Inspection', 'Other']),
  ...date('Date'),
  ...text('Location'),
  ...select('Status', ['Scheduled', 'Held', 'Cancelled']),
  ...text('Action Items'),
})

await createDb('Portals', {
  ...select('Portal Type', ['Letting Agent', 'Body Corp', 'Municipal', 'Bank', 'Insurance', 'Other']),
  ...text('Portal Name'),
  ...url('URL'),
  ...text('Login Credentials'),
  ...text('Notes'),
})

console.log('\n✅ All databases created.')
console.log('Add these database IDs to your Worker config / secrets.')
