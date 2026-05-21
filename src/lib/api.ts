import type { Adventure, AdventureData } from '@appTypes/adventure';
import type { Character, CharacterData } from '@appTypes/character';
import type { Event, EventData } from '@appTypes/event';
import type { Monster, MonsterData, MonsterGroup } from '@appTypes/monster';
import type { Npc, NpcData, NpcGroup } from '@appTypes/npc';
import type { Place, PlaceData } from '@appTypes/place';
interface ApiEnvelope<T> {
    adventure?: T;
    adventures?: T[];
    character?: T;
    characters?: T[];
    event?: T;
    events?: T[];
    monster?: T;
    monsters?: T[];
    monsterGroup?: T;
    monsterGroups?: T[];
    npc?: T;
    npcs?: T[];
    npcGroup?: T;
    npcGroups?: T[];
    place?: T;
    places?: T[];
    response?: T;
    tokenCount?: T;
    errorCode?: string;
}
export interface GeminiResponse {
    id: string;
    model: string;
    text: string;
    usage: GeminiUsage;
}
export interface CreateGeminiResponseRequest {
    instructions?: string;
    model?: string;
    prompt: string;
}
export interface GeminiTokenCount {
    model: string;
    totalTokens: number;
}
export interface GeminiUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
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
export const listAdventures = async (): Promise<Adventure[]> => {
    const payload = await requestJson<ApiEnvelope<Adventure>>('/api/adventures');
    return payload?.adventures ?? [];
};
export const createAdventure = async (): Promise<Adventure> => {
    const payload = await requestJson<ApiEnvelope<Adventure>>('/api/adventures', {
        method: 'POST',
    });
    if (!payload?.adventure) {
        throw new Error('errors.api.generic');
    }
    return payload.adventure;
};
export const getAdventure = async (adventureId: string): Promise<Adventure> => {
    const payload = await requestJson<ApiEnvelope<Adventure>>(`/api/adventures/${adventureId}`);
    if (!payload?.adventure) {
        throw new Error('errors.api.generic');
    }
    return payload.adventure;
};
export const saveAdventure = async (adventureId: string, adventure: AdventureData): Promise<Adventure> => {
    const payload = await requestJson<ApiEnvelope<Adventure>>(`/api/adventures/${adventureId}`, {
        method: 'PUT',
        body: JSON.stringify(adventure),
    });
    if (!payload?.adventure) {
        throw new Error('errors.api.generic');
    }
    return payload.adventure;
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
export const deleteMonsterGroup = async (groupId: string): Promise<void> => {
    await requestJson<null>(`/api/monster-groups/${groupId}`, {
        method: 'DELETE',
    });
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
export const listNpcs = async (): Promise<Npc[]> => {
    const payload = await requestJson<ApiEnvelope<Npc>>('/api/npcs');
    return payload?.npcs ?? [];
};
export const listNpcGroups = async (): Promise<NpcGroup[]> => {
    const payload = await requestJson<ApiEnvelope<NpcGroup>>('/api/npc-groups');
    return payload?.npcGroups ?? [];
};
export const createNpcGroup = async (name: string): Promise<NpcGroup> => {
    const payload = await requestJson<ApiEnvelope<NpcGroup>>('/api/npc-groups', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    if (!payload?.npcGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.npcGroup;
};
export const getNpcGroup = async (groupId: string): Promise<NpcGroup> => {
    const payload = await requestJson<ApiEnvelope<NpcGroup>>(`/api/npc-groups/${groupId}`);
    if (!payload?.npcGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.npcGroup;
};
export const saveNpcGroup = async (groupId: string, npcGroup: NpcGroup): Promise<NpcGroup> => {
    const payload = await requestJson<ApiEnvelope<NpcGroup>>(`/api/npc-groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({
            uniqueId: npcGroup.uniqueId,
            name: npcGroup.name,
            npcFileNames: npcGroup.npcFileNames,
        }),
    });
    if (!payload?.npcGroup) {
        throw new Error('errors.api.generic');
    }
    return payload.npcGroup;
};
export const deleteNpcGroup = async (groupId: string): Promise<void> => {
    await requestJson<null>(`/api/npc-groups/${groupId}`, {
        method: 'DELETE',
    });
};
export const createNpc = async (): Promise<Npc> => {
    const payload = await requestJson<ApiEnvelope<Npc>>('/api/npcs', {
        method: 'POST',
    });
    if (!payload?.npc) {
        throw new Error('errors.api.generic');
    }
    return payload.npc;
};
export const getNpc = async (npcId: string): Promise<Npc> => {
    const payload = await requestJson<ApiEnvelope<Npc>>(`/api/npcs/${npcId}`);
    if (!payload?.npc) {
        throw new Error('errors.api.generic');
    }
    return payload.npc;
};
export const saveNpc = async (npcId: string, npc: NpcData): Promise<Npc> => {
    const payload = await requestJson<ApiEnvelope<Npc>>(`/api/npcs/${npcId}`, {
        method: 'PUT',
        body: JSON.stringify(npc),
    });
    if (!payload?.npc) {
        throw new Error('errors.api.generic');
    }
    return payload.npc;
};
export const deleteNpc = async (npcId: string): Promise<void> => {
    await requestJson<null>(`/api/npcs/${npcId}`, {
        method: 'DELETE',
    });
};
export const uploadNpcImage = async (npcId: string, image: File): Promise<Npc> => {
    const response = await fetch(`/api/npcs/${npcId}/image`, {
        method: 'PUT',
        headers: {
            'Content-Type': image.type,
        },
        body: image,
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<Npc> | null;
    if (!response.ok) {
        const error = new Error(payload?.errorCode ?? 'errors.api.generic') as ApiError;
        error.code = payload?.errorCode ?? 'errors.api.generic';
        throw error;
    }
    if (!payload?.npc) {
        throw new Error('errors.api.generic');
    }
    return payload.npc;
};
export const deleteNpcImage = async (npcId: string): Promise<Npc> => {
    const payload = await requestJson<ApiEnvelope<Npc>>(`/api/npcs/${npcId}/image`, {
        method: 'DELETE',
    });
    if (!payload?.npc) {
        throw new Error('errors.api.generic');
    }
    return payload.npc;
};
export const listEvents = async (): Promise<Event[]> => {
    const payload = await requestJson<ApiEnvelope<Event>>('/api/events');
    return payload?.events ?? [];
};
export const createEvent = async (): Promise<Event> => {
    const payload = await requestJson<ApiEnvelope<Event>>('/api/events', {
        method: 'POST',
    });
    if (!payload?.event) {
        throw new Error('errors.api.generic');
    }
    return payload.event;
};
export const getEvent = async (eventId: string): Promise<Event> => {
    const payload = await requestJson<ApiEnvelope<Event>>(`/api/events/${eventId}`);
    if (!payload?.event) {
        throw new Error('errors.api.generic');
    }
    return payload.event;
};
export const saveEvent = async (eventId: string, event: EventData): Promise<Event> => {
    const payload = await requestJson<ApiEnvelope<Event>>(`/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(event),
    });
    if (!payload?.event) {
        throw new Error('errors.api.generic');
    }
    return payload.event;
};
export const deleteEvent = async (eventId: string): Promise<void> => {
    await requestJson<null>(`/api/events/${eventId}`, {
        method: 'DELETE',
    });
};
export const listPlaces = async (): Promise<Place[]> => {
    const payload = await requestJson<ApiEnvelope<Place>>('/api/places');
    return payload?.places ?? [];
};
export const createPlace = async (): Promise<Place> => {
    const payload = await requestJson<ApiEnvelope<Place>>('/api/places', {
        method: 'POST',
    });
    if (!payload?.place) {
        throw new Error('errors.api.generic');
    }
    return payload.place;
};
export const getPlace = async (placeId: string): Promise<Place> => {
    const payload = await requestJson<ApiEnvelope<Place>>(`/api/places/${placeId}`);
    if (!payload?.place) {
        throw new Error('errors.api.generic');
    }
    return payload.place;
};
export const savePlace = async (placeId: string, place: PlaceData): Promise<Place> => {
    const payload = await requestJson<ApiEnvelope<Place>>(`/api/places/${placeId}`, {
        method: 'PUT',
        body: JSON.stringify(place),
    });
    if (!payload?.place) {
        throw new Error('errors.api.generic');
    }
    return payload.place;
};
export const createGeminiResponse = async (request: CreateGeminiResponseRequest): Promise<GeminiResponse> => {
    const payload = await requestJson<ApiEnvelope<GeminiResponse>>('/api/gemini/responses', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    if (!payload?.response) {
        throw new Error('errors.api.generic');
    }
    return payload.response;
};
export const countGeminiTokens = async (request: CreateGeminiResponseRequest): Promise<GeminiTokenCount> => {
    const payload = await requestJson<ApiEnvelope<GeminiTokenCount>>('/api/gemini/tokens', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    if (!payload?.tokenCount) {
        throw new Error('errors.api.generic');
    }
    return payload.tokenCount;
};
