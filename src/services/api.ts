const BASE = '/api'

async function req<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Erro desconhecido')
  }
  return res.json()
}

function get<T>(path: string) {
  return req<T>(path)
}

function post<T>(path: string, body: unknown) {
  return req<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

function put<T>(path: string, body: unknown) {
  return req<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

function patch<T>(path: string, body?: unknown) {
  return req<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
}

function del<T>(path: string) {
  return req<T>(path, { method: 'DELETE' })
}

// Auth
export const api = {
  auth: {
    adminLogin: (email: string, senha: string) => post('/auth/admin-login', { email, senha }),
    adminSetup: (data: { nome: string; email: string; senha: string }) => post('/auth/admin-setup', data),
    paroquialLogin: (identifier: string, senha: string) => post('/auth/paroquial-login', { identifier, senha }),
    cebLogin: (paroquiaIdentifier: string, cebIdentifier: string, senha: string) =>
      post('/auth/ceb-login', { paroquiaIdentifier, cebIdentifier, senha }),
    logout: () => post('/auth/logout', {}),
    session: () => get('/auth/session'),
  },
  paroquias: {
    search: (q: string) => get(`/paroquias/search?q=${encodeURIComponent(q)}`),
  },
  admin: {
    paroquias: {
      list: () => get('/admin/paroquias'),
      create: (data: unknown) => post('/admin/paroquias', data),
      get: (id: string) => get(`/admin/paroquias/${id}`),
      update: (id: string, data: unknown) => put(`/admin/paroquias/${id}`, data),
      delete: (id: string) => del(`/admin/paroquias/${id}`),
      resetPassword: (id: string, novaSenha: string) => patch(`/admin/paroquias/${id}`, { novaSenha }),
    },
  },
  paroquial: {
    dashboard: () => get('/paroquial/dashboard'),
    configuracao: {
      get: () => get('/paroquial/configuracao'),
      create: (data: unknown) => post('/paroquial/configuracao', data),
    },
    cebs: {
      list: () => get('/paroquial/cebs'),
      create: (data: unknown) => post('/paroquial/cebs', data),
      get: (id: string) => get(`/paroquial/cebs/${id}`),
      update: (id: string, data: unknown) => put(`/paroquial/cebs/${id}`, data),
      delete: (id: string) => del(`/paroquial/cebs/${id}`),
      resetPassword: (id: string, novaSenha: string) => patch(`/paroquial/cebs/${id}`, { novaSenha }),
    },
    pastorais: {
      list: () => get('/paroquial/pastorais'),
      create: (data: unknown) => post('/paroquial/pastorais', data),
      update: (id: string, data: unknown) => put(`/paroquial/pastorais/${id}`, data),
      delete: (id: string) => del(`/paroquial/pastorais/${id}`),
    },
  },
  ceb: {
    dashboard: () => get('/ceb/dashboard'),
    alertas: {
      list: () => get('/ceb/alertas'),
      markAllRead: () => patch('/ceb/alertas'),
    },
    conselheiros: {
      list: () => get('/ceb/conselheiros'),
      create: (data: unknown) => post('/ceb/conselheiros', data),
      get: (id: string) => get(`/ceb/conselheiros/${id}`),
      update: (id: string, data: unknown) => put(`/ceb/conselheiros/${id}`, data),
      delete: (id: string) => del(`/ceb/conselheiros/${id}`),
      resetPassword: (id: string, novaSenha: string) => patch(`/ceb/conselheiros/${id}`, { novaSenha }),
    },
    dizimistas: {
      list: () => get('/ceb/dizimistas'),
      create: (data: unknown) => post('/ceb/dizimistas', data),
      get: (id: string) => get(`/ceb/dizimistas/${id}`),
      update: (id: string, data: unknown) => put(`/ceb/dizimistas/${id}`, data),
      delete: (id: string) => del(`/ceb/dizimistas/${id}`),
    },
    doacoes: {
      list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : ''
        return get(`/ceb/doacoes${qs}`)
      },
      create: (data: unknown) => post('/ceb/doacoes', data),
      get: (id: string) => get(`/ceb/doacoes/${id}`),
      update: (id: string, data: unknown) => put(`/ceb/doacoes/${id}`, data),
      delete: (id: string) => del(`/ceb/doacoes/${id}`),
    },
  },
}
