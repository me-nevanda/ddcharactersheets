import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Context, ContextData } from '../src/types/context';

interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}

const contextsDirectory = path.resolve(process.cwd(), 'data', 'contexts');
const safeContextIdPattern = /^[a-z0-9-]+$/i;

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

const normalizeContext = (data: Partial<Record<keyof ContextData, unknown>> = {}): ContextData => {
    return {
        uniqueId: normalizeUniqueId(data.uniqueId),
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
        characters: normalizeCharacters(data.characters),
        npcGroups: normalizeNpcGroups(data.npcGroups),
        monsterGroups: normalizeMonsterGroups(data.monsterGroups),
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
        const [rawContext, fileInfo] = await Promise.all([
            readFile(filePath, 'utf8'),
            stat(filePath),
        ]);
        return {
            id: contextId,
            ...normalizeContext(parseContext(rawContext)),
            updatedAt: fileInfo.mtime.toISOString(),
        };
    }));
    return contexts.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const readContext = async (contextId: string): Promise<Context> => {
    await ensureContextsDirectory();
    const filePath = getContextFilePath(contextId);
    const [rawContext, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
    ]);
    return {
        id: contextId,
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
};
