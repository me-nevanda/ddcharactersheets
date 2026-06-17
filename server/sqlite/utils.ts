import type { ApiError } from './types'

export const createNotFoundError = (): ApiError => {
  const error = new Error('Entity not found') as ApiError
  error.code = 'ENOENT'
  error.statusCode = 404
  return error
}

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

export const parsePayload = <TData>(payloadJson: string): Partial<Record<keyof TData, unknown>> => {
  const parsed = JSON.parse(payloadJson.replace(/^\uFEFF/, '') || '{}') as unknown
  return isRecord(parsed) ? (parsed as Partial<Record<keyof TData, unknown>>) : {}
}

export const parseJsonValue = (json: string): unknown => {
  try {
    return JSON.parse(json.replace(/^\uFEFF/, '') || '{}') as unknown
  } catch {
    return {}
  }
}

export const getPayloadMetadata = (payload: unknown): { name: string; uniqueId: string } => {
  if (!isRecord(payload)) {
    return { name: '', uniqueId: '' }
  }

  return {
    name: typeof payload.name === 'string' ? payload.name : '',
    uniqueId: typeof payload.uniqueId === 'string' ? payload.uniqueId : '',
  }
}

export const getMemberId = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const getMemberIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const ids: string[] = []
  for (const item of value) {
    const id = getMemberId(item)
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  return ids
}

export const normalizeStoredText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const rowNumber = (row: Record<string, unknown>, key: string): number => {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0
}

export const rowText = (row: Record<string, unknown>, key: string): string => {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}
