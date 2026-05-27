const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function del(path: string): Promise<void> {
  const res = await fetch(BASE + path, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

export const api = {
  dashboard: {
    get: () => get<any>('/dashboard'),
  },
  properties: {
    list: () => get<any[]>('/properties'),
    get: (id: string) => get<any>(`/properties/${id}`),
    create: (data: any) => post('/properties', data),
    update: (id: string, data: any) => put(`/properties/${id}`, data),
    units: (id: string) => get<any[]>(`/properties/${id}/units`),
  },
  propertyResource: {
    list: (propertyId: string, resource: string) => get<any[]>(`/properties/${propertyId}/${resource}`),
    create: (propertyId: string, resource: string, data: any) => post(`/properties/${propertyId}/${resource}`, data),
    update: (propertyId: string, resource: string, id: string, data: any) => put(`/properties/${propertyId}/${resource}/${id}`, data),
    remove: (propertyId: string, resource: string, id: string) => del(`/properties/${propertyId}/${resource}/${id}`),
  },
  history: {
    list: (propertyId: string) => get<any[]>(`/properties/${propertyId}/history`),
    create: (propertyId: string, data: any) => post(`/properties/${propertyId}/history`, data),
  },
  contacts: {
    list: (role?: string) => get<any[]>(`/contacts${role ? `?role=${role}` : ''}`),
    create: (data: any) => post('/contacts', data),
    update: (id: string, data: any) => put(`/contacts/${id}`, data),
    remove: (id: string) => del(`/contacts/${id}`),
  },
  ledger: {
    list: (source: string, propertyId: string) => get<any[]>(`/ledger/${source}?property_id=${propertyId}`),
  },
  workOrders: {
    list: (propertyId: string, status?: string) => get<any[]>(`/work-orders?property_id=${propertyId}${status && status !== 'all' ? `&status=${status}` : ''}`),
    create: (data: any) => post('/work-orders', data),
    update: (id: string, data: any) => put(`/work-orders/${id}`, data),
  },
  reconciliation: {
    list: (propertyId: string, status?: string) => get<any[]>(`/reconciliation?property_id=${propertyId}${status && status !== 'all' ? `&status=${status}` : ''}`),
    update: (id: string, data: any) => put(`/reconciliation/${id}`, data),
  },
  reports: {
    run: (type: string, propertyId?: string) => get<any[]>(`/reports/${type}${propertyId ? `?property_id=${propertyId}` : ''}`),
  },
}
