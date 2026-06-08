import { randomUUID } from 'node:crypto';
import type { Adventure, AdventureData } from '@appTypes/adventure';
import { createStoredEntity, listStoredEntities, readStoredEntity, updateStoredEntity } from './sqliteStore';

const safeAdventureIdPattern = /^[a-z0-9-]+$/i;

const normalizeUniqueId = (value: unknown): string => {
    return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID();
};

const normalizeAdventure = (data: Partial<Record<keyof AdventureData, unknown>> = {}): AdventureData => {
    return {
        uniqueId: normalizeUniqueId(data.uniqueId),
        name: typeof data.name === 'string' ? data.name : '',
        prompt: typeof data.prompt === 'string' ? data.prompt : '',
        output: typeof data.output === 'string' ? data.output : '',
    };
};

const adventureStoreOptions = {
    tableName: 'adventures',
    normalize: normalizeAdventure,
};

const ensureAdventuresStore = async (): Promise<void> => {};

export const isSafeAdventureId = (adventureId: string): boolean => {
    return safeAdventureIdPattern.test(adventureId);
};

export const listAdventures = async (): Promise<Adventure[]> => {
    await ensureAdventuresStore();
    return listStoredEntities<AdventureData, Adventure>(adventureStoreOptions);
};

export const readAdventure = async (adventureId: string): Promise<Adventure> => {
    await ensureAdventuresStore();
    return readStoredEntity<AdventureData, Adventure>(adventureId, adventureStoreOptions);
};

export const createAdventure = async (): Promise<Adventure> => {
    await ensureAdventuresStore();
    return createStoredEntity<AdventureData, Adventure>(adventureStoreOptions);
};

export const updateAdventure = async (adventureId: string, data: unknown): Promise<Adventure> => {
    await ensureAdventuresStore();
    return updateStoredEntity<AdventureData, Adventure>(adventureId, data, adventureStoreOptions);
};
