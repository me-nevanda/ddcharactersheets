import { readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Context, ContextData } from '@appTypes/context';
import { assertStoredEntityExists, createStoredContext, deleteStoredEntity, listStoredContexts, readStoredContext, updateStoredContext } from './sqliteStore';

interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}

export interface ContextImage {
    contentType: 'image/jpeg' | 'image/png';
    data: Buffer;
}

const contextsDirectory = path.resolve(process.cwd(), 'data', 'contexts');
const safeContextIdPattern = /^[a-z0-9-]+$/i;
const contextImageExtensions = ['jpg', 'png'] as const;

const normalizeCharacters = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seen = new Set<string>();
    const characters: string[] = [];
    for (const item of value) {
        if (typeof item !== 'string') {
            continue;
        }
        const trimmed = item.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        characters.push(trimmed);
    }
    return characters;
};

const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of value) {
        if (typeof item !== 'string') {
            continue;
        }
        const trimmed = item.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
};

const normalizeNpcGroups = (value: unknown): ContextData['npcGroups'] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seenIds = new Set<string>();
    const groups: ContextData['npcGroups'] = [];
    for (const item of value) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id.trim() : '';
        if (!id || seenIds.has(id)) {
            continue;
        }
        seenIds.add(id);
        const name = typeof record.name === 'string' ? record.name : '';
        const npcIds = normalizeStringArray(record.npcIds);
        groups.push({ id, name, npcIds });
    }
    return groups;
};

const normalizeCharacterGroups = (value: unknown): ContextData['characterGroups'] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seenIds = new Set<string>();
    const groups: ContextData['characterGroups'] = [];
    for (const item of value) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id.trim() : '';
        if (!id || seenIds.has(id)) {
            continue;
        }
        seenIds.add(id);
        const name = typeof record.name === 'string' ? record.name : '';
        const characterIds = normalizeStringArray(record.characterIds);
        groups.push({ id, name, characterIds });
    }
    return groups;
};

const normalizeMonsterGroups = (value: unknown): ContextData['monsterGroups'] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seenIds = new Set<string>();
    const groups: ContextData['monsterGroups'] = [];
    for (const item of value) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id.trim() : '';
        if (!id || seenIds.has(id)) {
            continue;
        }
        seenIds.add(id);
        const name = typeof record.name === 'string' ? record.name : '';
        const monsterIds = normalizeStringArray(record.monsterIds);
        groups.push({ id, name, monsterIds });
    }
    return groups;
};

const normalizeAreas = (value: unknown): ContextData['areas'] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const seenIds = new Set<string>();
    const areas: ContextData['areas'] = [];
    for (const item of value) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id.trim() : '';
        if (!id || seenIds.has(id)) {
            continue;
        }
        seenIds.add(id);
        const name = typeof record.name === 'string' ? record.name : '';
        const placeIds = normalizeStringArray(record.placeIds);
        areas.push({ id, name, placeIds });
    }
    return areas;
};

const normalizeContext = (data: Partial<Record<keyof ContextData, unknown>> = {}): ContextData => {
    return {
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
        characters: normalizeCharacters(data.characters),
        characterGroups: normalizeCharacterGroups(data.characterGroups),
        events: normalizeStringArray(data.events),
        npcGroups: normalizeNpcGroups(data.npcGroups),
        monsterGroups: normalizeMonsterGroups(data.monsterGroups),
        areas: normalizeAreas(data.areas),
    };
};

const getContextImageFilePath = (contextId: string, extension: (typeof contextImageExtensions)[number]): string => {
    if (!isSafeContextId(contextId)) {
        const error = new Error('Invalid context id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_CONTEXT_ID';
        throw error;
    }
    return path.join(contextsDirectory, `${contextId}.${extension}`);
};

const getContextImageInfo = async (contextId: string): Promise<{ contentType: ContextImage['contentType']; filePath: string; imageUrl: string } | null> => {
    for (const extension of contextImageExtensions) {
        const filePath = getContextImageFilePath(contextId, extension);
        try {
            await stat(filePath);
            return {
                contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
                filePath,
                imageUrl: `/api/contexts/${contextId}/image`,
            };
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }
    return null;
};

const normalizeImageExtension = (contentType: string | undefined): (typeof contextImageExtensions)[number] => {
    if (contentType === 'image/png') {
        return 'png';
    }
    if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
        return 'jpg';
    }
    const error = new Error('Invalid context image') as ApiError;
    error.statusCode = 400;
    error.code = 'API_INVALID_CONTEXT_IMAGE';
    throw error;
};

const contextStoreOptions = {
    tableName: 'contexts',
    imageUrl: (contextId: string): string => `/api/contexts/${contextId}/image`,
    normalize: normalizeContext,
};

const ensureContextsStore = async (): Promise<void> => {};

export const isSafeContextId = (contextId: string): boolean => {
    return safeContextIdPattern.test(contextId);
};

export const listContexts = async (): Promise<Context[]> => {
    await ensureContextsStore();
    const contexts = await listStoredContexts<ContextData, Context>(contextStoreOptions);
    return Promise.all(contexts.map(async (context) => ({
        ...context,
        imageUrl: (await getContextImageInfo(context.id))?.imageUrl ?? '',
    })));
};

export const readContext = async (contextId: string): Promise<Context> => {
    await ensureContextsStore();
    const [context, imageInfo] = await Promise.all([
        readStoredContext<ContextData, Context>(contextId, contextStoreOptions),
        getContextImageInfo(contextId),
    ]);
    return {
        ...context,
        imageUrl: imageInfo?.imageUrl ?? '',
    };
};

export const createContext = async (): Promise<Context> => {
    await ensureContextsStore();
    return createStoredContext<ContextData, Context>(contextStoreOptions);
};

export const updateContext = async (contextId: string, data: unknown): Promise<Context> => {
    await ensureContextsStore();
    return updateStoredContext<ContextData, Context>(contextId, data, contextStoreOptions);
};

export const deleteContext = async (contextId: string): Promise<void> => {
    await ensureContextsStore();
    await deleteStoredEntity(contextStoreOptions.tableName, contextId);
    await Promise.all(contextImageExtensions.map(async (extension) => {
        try {
            await unlink(getContextImageFilePath(contextId, extension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
};

export const readContextImage = async (contextId: string): Promise<ContextImage> => {
    await ensureContextsStore();
    const imageInfo = await getContextImageInfo(contextId);
    if (!imageInfo) {
        const error = new Error('Context image not found') as ApiError;
        error.statusCode = 404;
        error.code = 'ENOENT';
        throw error;
    }
    return {
        contentType: imageInfo.contentType,
        data: await readFile(imageInfo.filePath),
    };
};

export const updateContextImage = async (contextId: string, contentType: string | undefined, data: Buffer): Promise<Context> => {
    await ensureContextsStore();
    await assertStoredEntityExists(contextStoreOptions.tableName, contextId);
    const extension = normalizeImageExtension(contentType);
    const nextFilePath = getContextImageFilePath(contextId, extension);
    const staleExtensions = contextImageExtensions.filter((imageExtension) => imageExtension !== extension);
    await Promise.all(staleExtensions.map(async (staleExtension) => {
        try {
            await unlink(getContextImageFilePath(contextId, staleExtension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
    await writeFile(nextFilePath, data);
    return readContext(contextId);
};

export const deleteContextImage = async (contextId: string): Promise<Context> => {
    await ensureContextsStore();
    await assertStoredEntityExists(contextStoreOptions.tableName, contextId);
    await Promise.all(contextImageExtensions.map(async (extension) => {
        try {
            await unlink(getContextImageFilePath(contextId, extension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
    return readContext(contextId);
};
