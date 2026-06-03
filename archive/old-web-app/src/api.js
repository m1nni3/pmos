const API = '/api'

async function get(path) {
  const r = await fetch(API + path)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function post(path, body) {
  const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function put(path, body) {
  const r = await fetch(API + path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function del(path) {
  const r = await fetch(API + path, { method: 'DELETE' })
  if (!r.ok) throw new Error(await r.text())
}

export { get, post, put, del }
