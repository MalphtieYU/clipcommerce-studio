import type { Asset, Channel, Goal, ImportBatch, ImportIssue, Product, WorkContext, ContextFeedback } from '../types'

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const payload = await response.json().catch(() => ({ message: '本地服务返回了无法解析的响应' }))
  if (!response.ok) {
    const error = new Error(payload.message || payload.errors?.[0]?.message || `请求失败（${response.status}）`)
    Object.assign(error, { status: response.status, payload })
    throw error
  }
  return payload as T
}

export const localApi = {
  health: () => api<{ ok: boolean; database: string; products: number }>('/api/health'),
  products: {
    list: () => api<Product[]>('/api/products'),
    create: (body: unknown) => api<Product>('/api/products', { method: 'POST', body }),
    update: (id: string, body: unknown) => api<Product>(`/api/products/${id}`, { method: 'PUT', body }),
    archive: (id: string) => api<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
  },
  channels: () => api<Channel[]>('/api/channels'),
  assets: {
    list: () => api<Asset[]>('/api/assets'),
    create: (body: unknown) => api<Asset>('/api/assets', { method: 'POST', body }),
    update: (id: string, body: unknown) => api<Asset>(`/api/assets/${id}`, { method: 'PUT', body }),
    archive: (id: string) => api<{ ok: boolean }>(`/api/assets/${id}`, { method: 'DELETE' }),
    createVersion: (id: string, body: unknown) => api(`/api/assets/${id}/versions`, { method: 'POST', body }),
  },
  goals: {
    list: () => api<Goal[]>('/api/goals'),
    create: (body: unknown) => api<Goal>('/api/goals', { method: 'POST', body }),
    update: (id: string, body: unknown) => api<Goal>(`/api/goals/${id}`, { method: 'PUT', body }),
    pause: (id: string) => api<{ ok: boolean }>(`/api/goals/${id}`, { method: 'DELETE' }),
    progress: (id: string, body: unknown) => api(`/api/goals/${id}/progress`, { method: 'POST', body }),
  },
  imports: {
    list: () => api<ImportBatch[]>('/api/imports'),
    validate: (body: unknown) => api<{ ok: boolean; rows: Record<string, unknown>[]; errors: ImportIssue[]; warnings: ImportIssue[] }>('/api/imports/validate', { method: 'POST', body }),
    parseXlsx: (body: unknown) => api<{ sourceType: 'xlsx'; headers: string[]; rows: Record<string, unknown>[]; warnings: string[] }>('/api/imports/parse-xlsx', { method: 'POST', body }),
    commit: (body: unknown) => api<{ ok: boolean; batchId: string; recordCount: number; warnings: ImportIssue[] }>('/api/imports', { method: 'POST', body }),
    undo: (id: string) => api<{ ok: boolean }>(`/api/imports/${id}/undo`, { method: 'POST' }),
  },
  workContexts: {
    list: () => api<WorkContext[]>('/api/work-contexts'),
    create: (body: unknown) => api<WorkContext>('/api/work-contexts', { method: 'POST', body }),
    update: (id: string, body: unknown) => api<WorkContext>(`/api/work-contexts/${id}`, { method: 'PUT', body }),
    archive: (id: string) => api<{ ok: boolean }>(`/api/work-contexts/${id}`, { method: 'DELETE' }),
    agentBrief: (id: string) => api<Record<string, unknown>>(`/api/work-contexts/${id}/agent-brief`),
    collaborationPacket: (id: string) => api<Record<string, unknown>>(`/api/work-contexts/${id}/collaboration-packet`),
    addFeedback: (id: string, body: unknown) => api<ContextFeedback>(`/api/work-contexts/${id}/feedback`, { method: 'POST', body }),
  },
}
