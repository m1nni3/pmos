import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const parentPageId = process.env.PARENT_PAGE_ID

async function listDbs(pageId) {
  const response = await notion.blocks.children.list({ block_id: pageId })
  for (const child of response.results) {
    if (child.type === 'child_database') {
      const db = await notion.databases.retrieve({ database_id: child.id })
      const title = db.title.map(t => t.plain_text).join('')
      console.log(`${title}: ${child.id}`)
    }
  }
}

console.log('Databases on PMOS page:\n')
await listDbs(parentPageId)
