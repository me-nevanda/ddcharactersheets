import type { Character, CharacterData } from '../types/character'

interface ApiEnvelope<T> {
  character?: T
  characters?: T[]
  errorCode?: string
}

export interface ApiError extends Error {
  code: string
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    const error = new Error(payload?.errorCode ?? 'errors.api.generic') as ApiError
    error.code = payload?.errorCode ?? 'errors.api.generic'
    throw error
  }

  return payload as T | null
}

export async function listCharacters(): Promise<Character[]> {
  const payload = await requestJson<ApiEnvelope<Character>>('/api/characters')
  return payload?.characters ?? []
}

export async function createCharacter(): Promise<Character> {
  const payload = await requestJson<ApiEnvelope<Character>>('/api/characters', {
    method: 'POST',
  })

  if (!payload?.character) {
    throw new Error('errors.api.generic')
  }

  return payload.character
}

export async function getCharacter(characterId: string): Promise<Character> {
  const payload = await requestJson<ApiEnvelope<Character>>(`/api/characters/${characterId}`)

  if (!payload?.character) {
    throw new Error('errors.api.generic')
  }

  return payload.character
}

export async function saveCharacter(
  characterId: string,
  character: CharacterData,
): Promise<Character> {
  const payload = await requestJson<ApiEnvelope<Character>>(`/api/characters/${characterId}`, {
    method: 'PUT',
    body: JSON.stringify(character),
  })

  if (!payload?.character) {
    throw new Error('errors.api.generic')
  }

  return payload.character
}

export async function deleteCharacter(characterId: string): Promise<void> {
  await requestJson<null>(`/api/characters/${characterId}`, {
    method: 'DELETE',
  })
}
