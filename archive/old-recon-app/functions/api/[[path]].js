const TARGET = 'https://pmos-api.dawson-edc.workers.dev/api'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const targetUrl = TARGET + url.pathname.replace(/^\/api/, '') + url.search
  const init = {
    method: context.request.method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (['POST','PUT'].includes(context.request.method)) {
    init.body = await context.request.text()
  }
  const resp = await fetch(targetUrl, init)
  return new Response(resp.body, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
