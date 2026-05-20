import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Adventure, AdventureData } from '../src/types/adventure';

interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}

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

const parseAdventure = (rawAdventure: string): Partial<Record<keyof AdventureData, unknown>> => {
    return JSON.parse(rawAdventure.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof AdventureData, unknown>>;
};

const ensureAdventuresDirectory = async (): Promise<void> => {
    await mkdir(adventuresDirectory, { recursive: true });
};

const getAdventureFilePath = (adventureId: string): string => {
    if (!isSafeAdventureId(adventureId)) {
        const error = new Error('Invalid adventure id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_ADVENTURE_ID';
        throw error;
    }
    return path.join(adventuresDirectory, `${adventureId}.json`);
};

export const isSafeAdventureId = (adventureId: string): boolean => {
    return safeAdventureIdPattern.test(adventureId);
};

export const listAdventures = async (): Promise<Adventure[]> => {
    await ensureAdventuresDirectory();
    const entries = await readdir(adventuresDirectory, { withFileTypes: true });
    const adventureFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'));
    const adventures = await Promise.all(adventureFiles.map(async (entry) => {
        const adventureId = path.basename(entry.name, '.json');
        const filePath = getAdventureFilePath(adventureId);
        const [rawAdventure, fileInfo] = await Promise.all([
            readFile(filePath, 'utf8'),
            stat(filePath),
        ]);
        return {
            id: adventureId,
            ...normalizeAdventure(parseAdventure(rawAdventure)),
            updatedAt: fileInfo.mtime.toISOString(),
        };
    }));
    return adventures.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const readAdventure = async (adventureId: string): Promise<Adventure> => {
    await ensureAdventuresDirectory();
    const filePath = getAdventureFilePath(adventureId);
    const [rawAdventure, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
    ]);
    return {
        id: adventureId,
        ...normalizeAdventure(parseAdventure(rawAdventure)),
        updatedAt: fileInfo.mtime.toISOString(),
    };
};

export const createAdventure = async (): Promise<Adventure> => {
    await ensureAdventuresDirectory();
    const adventureId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const filePath = getAdventureFilePath(adventureId);
    await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8');
    return readAdventure(adventureId);
};

export const updateAdventure = async (adventureId: string, data: unknown): Promise<Adventure> => {
    await ensureAdventuresDirectory();
    const filePath = getAdventureFilePath(adventureId);
    const rawAdventure = await readFile(filePath, 'utf8');
    const existingAdventure = parseAdventure(rawAdventure);
    const nextAdventure = normalizeAdventure({
        ...existingAdventure,
        ...(typeof data === 'object' && data !== null
            ? (data as Partial<Record<keyof AdventureData, unknown>>)
            : {}),
    });
    await writeFile(filePath, `${JSON.stringify(nextAdventure, null, 2)}\n`, 'utf8');
    return readAdventure(adventureId);
};
