import type { Character, CharacterData } from '@appTypes/character';
import type { Monster, MonsterData, MonsterGroup } from '@appTypes/monster';
interface ApiEnvelope<T> {
    character?: T;
    characters?: T[];
    monster?: T;
    monsters?: T[];
    monsterGroup?: T;
    monsterGroups?: T[];
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
export const uploadCharacterImage = async (characterId: string, image: File): Promise<Character> => {
    const response = await fetch(`/api/characters/${characterId}/image`, {
        method: 'PUT',
        headers: {
            'Content-Type': image.type,
        },
        body: image,
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<Character> | null;
    if (!response.ok) {
        const error = new Error(payload?.errorCode ?? 'errors.api.generic') as ApiError;
        error.code = payload?.errorCode ?? 'errors.api.generic';
        throw error;
    }
    if (!payload?.character) {
        throw new Error('errors.api.generic');
    }
    return payload.character;
};
export const deleteCharacterImage = async (characterId: string): Promise<Character> => {
    const payload = await requestJson<ApiEnvelope<Character>>(`/api/characters/${characterId}/image`, {
        method: 'DELETE',
    });
    if (!payload?.character) {
        throw new Error('errors.api.generic');
    }
    return payload.character;
};
export const listMonsters = async (): Promise<Monster[]> => {
    const payload = await requestJson<ApiEnvelope<Monster>>('/api/monsters');
    return payload?.monsters ?? [];
};
export const listMonsterGroups = async (): Promise<MonsterGroup[]> => {
    const payload = await requestJson<ApiEnvelope<MonsterGroup>>('/api/monster-groups');
    return payload?.monsterGroups ?? [];
};
export const createMonsterGroup = async (name: string): Promise<MonsterGroup> => {
    const payload = await requestJson<ApiEnvelope<MonsterGroup>>('/api/monster-groups', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    if (!payload?.monsterGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.monsterGroup;
};
export const getMonsterGroup = async (groupId: string): Promise<MonsterGroup> => {
    const payload = await requestJson<ApiEnvelope<MonsterGroup>>(`/api/monster-groups/${groupId}`);
    if (!payload?.monsterGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.monsterGroup;
};
export const saveMonsterGroup = async (groupId: string, monsterGroup: MonsterGroup): Promise<MonsterGroup> => {
    const payload = await requestJson<ApiEnvelope<MonsterGroup>>(`/api/monster-groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({
            uniqueId: monsterGroup.uniqueId,
            name: monsterGroup.name,
            monsterFileNames: monsterGroup.monsterFileNames,
        }),
    });
    if (!payload?.monsterGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.monsterGroup;
};
export const createMonster = async (): Promise<Monster> => {
    const payload = await requestJson<ApiEnvelope<Monster>>('/api/monsters', {
        method: 'POST',
    });
    if (!payload?.monster) {
        throw new Error('errors.api.generic');
    }
    return payload.monster;
};
export const getMonster = async (monsterId: string): Promise<Monster> => {
    const payload = await requestJson<ApiEnvelope<Monster>>(`/api/monsters/${monsterId}`);
    if (!payload?.monster) {
        throw new Error('errors.api.generic');
    }
    return payload.monster;
};
export const saveMonster = async (monsterId: string, monster: MonsterData): Promise<Monster> => {
    const payload = await requestJson<ApiEnvelope<Monster>>(`/api/monsters/${monsterId}`, {
        method: 'PUT',
        body: JSON.stringify(monster),
    });
    if (!payload?.monster) {
        throw new Error('errors.api.generic');
    }
    return payload.monster;
};
export const deleteMonster = async (monsterId: string): Promise<void> => {
    await requestJson<null>(`/api/monsters/${monsterId}`, {
        method: 'DELETE',
    });
};
export const uploadMonsterImage = async (monsterId: string, image: File): Promise<Monster> => {
    const response = await fetch(`/api/monsters/${monsterId}/image`, {
        method: 'PUT',
        headers: {
            'Content-Type': image.type,
        },
        body: image,
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<Monster> | null;
    if (!response.ok) {
        const error = new Error(payload?.errorCode ?? 'errors.api.generic') as ApiError;
        error.code = payload?.errorCode ?? 'errors.api.generic';
        throw error;
    }
    if (!payload?.monster) {
        throw new Error('errors.api.generic');
    }
    return payload.monster;
};
export const deleteMonsterImage = async (monsterId: string): Promise<Monster> => {
    const payload = await requestJson<ApiEnvelope<Monster>>(`/api/monsters/${monsterId}/image`, {
        method: 'DELETE',
    });
    if (!payload?.monster) {
        throw new Error('errors.api.generic');
    }
    return payload.monster;
};
