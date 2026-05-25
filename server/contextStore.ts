import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Context, ContextData } from '../src/types/context';

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

const normalizeUniqueId = (value: unknown): string => {
    return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID();
};

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
        uniqueId: normalizeUniqueId(data.uniqueId),
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

const parseContext = (rawContext: string): Partial<Record<keyof ContextData, unknown>> => {
    return JSON.parse(rawContext.replace(/^﻿/, '') || '{}') as Partial<Record<keyof ContextData, unknown>>;
};

const ensureContextsDirectory = async (): Promise<void> => {
    await mkdir(contextsDirectory, { recursive: true });
};

const getContextFilePath = (contextId: string): string => {
    if (!isSafeContextId(contextId)) {
        const error = new Error('Invalid context id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_CONTEXT_ID';
        throw error;
    }
    return path.join(contextsDirectory, `${contextId}.json`);
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

export const isSafeContextId = (contextId: string): boolean => {
    return safeContextIdPattern.test(contextId);
};

export const listContexts = async (): Promise<Context[]> => {
    await ensureContextsDirectory();
    const entries = await readdir(contextsDirectory, { withFileTypes: true });
    const contextFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'));
    const contexts = await Promise.all(contextFiles.map(async (entry) => {
        const contextId = path.basename(entry.name, '.json');
        const filePath = getContextFilePath(contextId);
        const [rawContext, fileInfo, imageInfo] = await Promise.all([
            readFile(filePath, 'utf8'),
            stat(filePath),
            getContextImageInfo(contextId),
        ]);
        return {
            id: contextId,
            imageUrl: imageInfo?.imageUrl ?? '',
            ...normalizeContext(parseContext(rawContext)),
            updatedAt: fileInfo.mtime.toISOString(),
        };
    }));
    return contexts.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const readContext = async (contextId: string): Promise<Context> => {
    await ensureContextsDirectory();
    const filePath = getContextFilePath(contextId);
    const [rawContext, fileInfo, imageInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
        getContextImageInfo(contextId),
    ]);
    return {
        id: contextId,
        imageUrl: imageInfo?.imageUrl ?? '',
        ...normalizeContext(parseContext(rawContext)),
        updatedAt: fileInfo.mtime.toISOString(),
    };
};

export const createContext = async (): Promise<Context> => {
    await ensureContextsDirectory();
    const contextId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const filePath = getContextFilePath(contextId);
    await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8');
    return readContext(contextId);
};

export const updateContext = async (contextId: string, data: unknown): Promise<Context> => {
    await ensureContextsDirectory();
    const filePath = getContextFilePath(contextId);
    const rawContext = await readFile(filePath, 'utf8');
    const existingContext = parseContext(rawContext);
    const nextContext = normalizeContext({
        ...existingContext,
        ...(typeof data === 'object' && data !== null
            ? (data as Partial<Record<keyof ContextData, unknown>>)
            : {}),
    });
    await writeFile(filePath, `${JSON.stringify(nextContext, null, 2)}\n`, 'utf8');
    return readContext(contextId);
};

export const deleteContext = async (contextId: string): Promise<void> => {
    await ensureContextsDirectory();
    const filePath = getContextFilePath(contextId);
    await unlink(filePath);
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
    await ensureContextsDirectory();
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
    await ensureContextsDirectory();
    await stat(getContextFilePath(contextId));
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
    await ensureContextsDirectory();
    await stat(getContextFilePath(contextId));
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
