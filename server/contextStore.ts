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

const normalizeContext = (data: Partial<Record<keyof ContextData, unknown>> = {}): ContextData => {
    return {
        uniqueId: normalizeUniqueId(data.uniqueId),
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
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
