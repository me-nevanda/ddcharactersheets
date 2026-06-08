import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Adventure, AdventureData } from '../src/types/adventure';
import { createStoredEntity, listStoredEntities, migrateJsonDirectoryToSqlite, readStoredEntity, updateStoredEntity } from './sqliteStore';

const adventuresDirectory = path.resolve(process.cwd(), 'data', 'adventures');
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

const ensureAdventuresStore = async (): Promise<void> => {
    await migrateJsonDirectoryToSqlite({
        directory: adventuresDirectory,
        tableName: adventureStoreOptions.tableName,
        isSafeId: isSafeAdventureId,
    });
};

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
