export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)

  const userEmail = request.headers.get('Cf-Access-Authenticated-User-Email')
  const adminEmails = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const isAuthenticated = !!userEmail
  const role = userEmail && adminEmails.includes(userEmail.toLowerCase()) ? 'admin' : (isAuthenticated ? 'readonly' : null)

  if (url.pathname === '/api/_auth/me') {
    return new Response(JSON.stringify({
      authenticated: isAuthenticated,
      email: userEmail || null,
      role: role,
    }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }

  const target = `https://pmos-api.dawson-edc.workers.dev/api${url.pathname.replace(/^\/api/, '')}${url.search}`

  const headers = new Headers(request.headers)
  if (role) headers.set('X-PMOS-Role', role)

  const req = new Request(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'follow',
  })

  return fetch(req)
}
