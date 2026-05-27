const API_WORKER = 'https://pmos-api.dawson-edc.workers.dev'

export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url)
  const apiUrl = API_WORKER + url.pathname + url.search

  const headers = new Headers(context.request.headers)
  headers.delete('host')

  return fetch(apiUrl, {
    method: context.request.method,
    headers,
    body: context.request.method === 'GET' || context.request.method === 'HEAD' ? null : context.request.body,
  })
}
