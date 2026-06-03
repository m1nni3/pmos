import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const parentPageId = process.env.PARENT_PAGE_ID

if (!notion.auth || !parentPageId) {
  console.error('Usage: NOTION_API_KEY=ntn_xxx PARENT_PAGE_ID=<page_id> node scripts/cleanup-notion.mjs')
  process.exit(1)
}

async function deleteChildren(pageId) {
  const response = await notion.blocks.children.list({ block_id: pageId })
  const children = response.results

  for (const child of children) {
    process.stdout.write(`Deleting ${child.type}: ${child.id}... `)
    try {
      if (child.type === 'child_database') {
        await notion.databases.update({ database_id: child.id, archived: true })
      } else {
        await notion.blocks.delete({ block_id: child.id })
      }
      console.log('✓')
    } catch (e) {
      console.log('✘', e.message)
    }
  }
}

console.log('Cleaning up PMOS page...')
await deleteChildren(parentPageId)
console.log('✅ Page cleared. Now re-run the setup script.')
