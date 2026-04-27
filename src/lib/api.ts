import type { Character, CharacterData } from '../types/character';
interface ApiEnvelope<T> {
    character?: T;
    characters?: T[];
    errorCode?: string;
}
export interface ApiError extends Error {
    code: string;
}
const requestJson = async <T>(url: string, options: RequestInit = {}): Promise<T | null> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!response.ok) {
        const error = new Error(payload?.errorCode ?? 'errors.api.generic') as ApiError;
        error.code = payload?.errorCode ?? 'errors.api.generic';
        throw error;
    }
    return payload as T | null;
};
export const listCharacters = async (): Promise<Character[]> => {
    const payload = await requestJson<ApiEnvelope<Character>>('/api/characters');
    return payload?.characters ?? [];
};
export const createCharacter = async (): Promise<Character> => {
    const payload = await requestJson<ApiEnvelope<Character>>('/api/characters', {
        method: 'POST',
    });
    if (!payload?.character) {
        throw new Error('errors.api.generic');
    }
    return payload.character;
};
export const getCharacter = async (characterId: string): Promise<Character> => {
    const payload = await requestJson<ApiEnvelope<Character>>(`/api/characters/${characterId}`);
    if (!payload?.character) {
        throw new Error('errors.api.generic');
    }
    return payload.character;
};
export const saveCharacter = async (characterId: string, character: CharacterData): Promise<Character> => {
    const payload = await requestJson<ApiEnvelope<Character>>(`/api/characters/${characterId}`, {
        method: 'PUT',
        body: JSON.stringify(character),
    });
    if (!payload?.character) {
        throw new Error('errors.api.generic');
    }
    return payload.character;
};
export const deleteCharacter = async (characterId: string): Promise<void> => {
    await requestJson<null>(`/api/characters/${characterId}`, {
        method: 'DELETE',
    });
};
