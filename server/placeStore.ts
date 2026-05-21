import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Place, PlaceData, PlaceItem } from '../src/types/place';

interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}

const placesDirectory = path.resolve(process.cwd(), 'data', 'places');
const safePlaceIdPattern = /^[a-z0-9-]+$/i;

const normalizeUniqueId = (value: unknown): string => {
    return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID();
};

const normalizePlaceItem = (data: Partial<Record<keyof PlaceItem, unknown>> = {}): PlaceItem => {
    return {
        id: typeof data.id === 'string' && data.id.trim().length > 0 ? data.id : randomUUID(),
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
    };
};

const normalizePlaceItems = (value: unknown): PlaceItem[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((entry) => normalizePlaceItem(typeof entry === 'object' && entry !== null ? (entry as Partial<Record<keyof PlaceItem, unknown>>) : {}));
};

const normalizePlace = (data: Partial<Record<keyof PlaceData, unknown>> = {}): PlaceData => {
    return {
        uniqueId: normalizeUniqueId(data.uniqueId),
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
        places: normalizePlaceItems(data.places),
    };
};

const parsePlace = (rawPlace: string): Partial<Record<keyof PlaceData, unknown>> => {
    return JSON.parse(rawPlace.replace(/^﻿/, '') || '{}') as Partial<Record<keyof PlaceData, unknown>>;
};

const ensurePlacesDirectory = async (): Promise<void> => {
    await mkdir(placesDirectory, { recursive: true });
};

const getPlaceFilePath = (placeId: string): string => {
    if (!isSafePlaceId(placeId)) {
        const error = new Error('Invalid place id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_PLACE_ID';
        throw error;
    }
    return path.join(placesDirectory, `${placeId}.json`);
};

export const isSafePlaceId = (placeId: string): boolean => {
    return safePlaceIdPattern.test(placeId);
};

export const listPlaces = async (): Promise<Place[]> => {
    await ensurePlacesDirectory();
    const entries = await readdir(placesDirectory, { withFileTypes: true });
    const placeFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'));
    const places = await Promise.all(placeFiles.map(async (entry) => {
        const placeId = path.basename(entry.name, '.json');
        const filePath = getPlaceFilePath(placeId);
        const [rawPlace, fileInfo] = await Promise.all([
            readFile(filePath, 'utf8'),
            stat(filePath),
        ]);
        return {
            id: placeId,
            ...normalizePlace(parsePlace(rawPlace)),
            updatedAt: fileInfo.mtime.toISOString(),
        };
    }));
    return places.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const readPlace = async (placeId: string): Promise<Place> => {
    await ensurePlacesDirectory();
    const filePath = getPlaceFilePath(placeId);
    const [rawPlace, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
    ]);
    return {
        id: placeId,
        ...normalizePlace(parsePlace(rawPlace)),
        updatedAt: fileInfo.mtime.toISOString(),
    };
};

export const createPlace = async (): Promise<Place> => {
    await ensurePlacesDirectory();
    const placeId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const filePath = getPlaceFilePath(placeId);
    await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8');
    return readPlace(placeId);
};

export const updatePlace = async (placeId: string, data: unknown): Promise<Place> => {
    await ensurePlacesDirectory();
    const filePath = getPlaceFilePath(placeId);
    const rawPlace = await readFile(filePath, 'utf8');
    const existingPlace = parsePlace(rawPlace);
    const nextPlace = normalizePlace({
        ...existingPlace,
        ...(typeof data === 'object' && data !== null
            ? (data as Partial<Record<keyof PlaceData, unknown>>)
            : {}),
    });
    await writeFile(filePath, `${JSON.stringify(nextPlace, null, 2)}\n`, 'utf8');
    return readPlace(placeId);
};
