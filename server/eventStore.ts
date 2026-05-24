import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Event, EventData } from '../src/types/event';

interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}

export interface EventImage {
    contentType: 'image/jpeg' | 'image/png';
    data: Buffer;
}

const eventsDirectory = path.resolve(process.cwd(), 'data', 'events');
const safeEventIdPattern = /^[a-z0-9-]+$/i;
const eventImageExtensions = ['jpg', 'png'] as const;

const normalizeUniqueId = (value: unknown): string => {
    return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID();
};

const normalizeEvent = (data: Partial<Record<keyof EventData, unknown>> = {}): EventData => {
    return {
        uniqueId: normalizeUniqueId(data.uniqueId),
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : '',
    };
};

const parseEvent = (rawEvent: string): Partial<Record<keyof EventData, unknown>> => {
    return JSON.parse(rawEvent.replace(/^﻿/, '') || '{}') as Partial<Record<keyof EventData, unknown>>;
};

const ensureEventsDirectory = async (): Promise<void> => {
    await mkdir(eventsDirectory, { recursive: true });
};

const getEventFilePath = (eventId: string): string => {
    if (!isSafeEventId(eventId)) {
        const error = new Error('Invalid event id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_EVENT_ID';
        throw error;
    }
    return path.join(eventsDirectory, `${eventId}.json`);
};

const getEventImageFilePath = (eventId: string, extension: (typeof eventImageExtensions)[number]): string => {
    if (!isSafeEventId(eventId)) {
        const error = new Error('Invalid event id') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_EVENT_ID';
        throw error;
    }
    return path.join(eventsDirectory, `${eventId}.${extension}`);
};

const getEventImageInfo = async (eventId: string): Promise<{ contentType: EventImage['contentType']; filePath: string; imageUrl: string } | null> => {
    for (const extension of eventImageExtensions) {
        const filePath = getEventImageFilePath(eventId, extension);
        try {
            await stat(filePath);
            return {
                contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
                filePath,
                imageUrl: `/api/events/${eventId}/image`,
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

const normalizeImageExtension = (contentType: string | undefined): (typeof eventImageExtensions)[number] => {
    if (contentType === 'image/png') {
        return 'png';
    }
    if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
        return 'jpg';
    }
    const error = new Error('Invalid event image') as ApiError;
    error.statusCode = 400;
    error.code = 'API_INVALID_EVENT_IMAGE';
    throw error;
};

export const isSafeEventId = (eventId: string): boolean => {
    return safeEventIdPattern.test(eventId);
};

export const listEvents = async (): Promise<Event[]> => {
    await ensureEventsDirectory();
    const entries = await readdir(eventsDirectory, { withFileTypes: true });
    const eventFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'));
    const events = await Promise.all(eventFiles.map(async (entry) => {
        const eventId = path.basename(entry.name, '.json');
        const filePath = getEventFilePath(eventId);
        const [rawEvent, fileInfo, imageInfo] = await Promise.all([
            readFile(filePath, 'utf8'),
            stat(filePath),
            getEventImageInfo(eventId),
        ]);
        return {
            id: eventId,
            imageUrl: imageInfo?.imageUrl ?? '',
            ...normalizeEvent(parseEvent(rawEvent)),
            updatedAt: fileInfo.mtime.toISOString(),
        };
    }));
    return events.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const readEvent = async (eventId: string): Promise<Event> => {
    await ensureEventsDirectory();
    const filePath = getEventFilePath(eventId);
    const [rawEvent, fileInfo, imageInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
        getEventImageInfo(eventId),
    ]);
    return {
        id: eventId,
        imageUrl: imageInfo?.imageUrl ?? '',
        ...normalizeEvent(parseEvent(rawEvent)),
        updatedAt: fileInfo.mtime.toISOString(),
    };
};

export const createEvent = async (): Promise<Event> => {
    await ensureEventsDirectory();
    const eventId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const filePath = getEventFilePath(eventId);
    await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8');
    return readEvent(eventId);
};

export const updateEvent = async (eventId: string, data: unknown): Promise<Event> => {
    await ensureEventsDirectory();
    const filePath = getEventFilePath(eventId);
    const rawEvent = await readFile(filePath, 'utf8');
    const existingEvent = parseEvent(rawEvent);
    const nextEvent = normalizeEvent({
        ...existingEvent,
        ...(typeof data === 'object' && data !== null
            ? (data as Partial<Record<keyof EventData, unknown>>)
            : {}),
    });
    await writeFile(filePath, `${JSON.stringify(nextEvent, null, 2)}\n`, 'utf8');
    return readEvent(eventId);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    await ensureEventsDirectory();
    const filePath = getEventFilePath(eventId);
    await unlink(filePath);
    await Promise.all(eventImageExtensions.map(async (extension) => {
        try {
            await unlink(getEventImageFilePath(eventId, extension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
};

export const readEventImage = async (eventId: string): Promise<EventImage> => {
    await ensureEventsDirectory();
    const imageInfo = await getEventImageInfo(eventId);
    if (!imageInfo) {
        const error = new Error('Event image not found') as ApiError;
        error.statusCode = 404;
        error.code = 'ENOENT';
        throw error;
    }
    return {
        contentType: imageInfo.contentType,
        data: await readFile(imageInfo.filePath),
    };
};

export const updateEventImage = async (eventId: string, contentType: string | undefined, data: Buffer): Promise<Event> => {
    await ensureEventsDirectory();
    await stat(getEventFilePath(eventId));
    const extension = normalizeImageExtension(contentType);
    const nextFilePath = getEventImageFilePath(eventId, extension);
    const staleExtensions = eventImageExtensions.filter((imageExtension) => imageExtension !== extension);
    await Promise.all(staleExtensions.map(async (staleExtension) => {
        try {
            await unlink(getEventImageFilePath(eventId, staleExtension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
    await writeFile(nextFilePath, data);
    return readEvent(eventId);
};

export const deleteEventImage = async (eventId: string): Promise<Event> => {
    await ensureEventsDirectory();
    await stat(getEventFilePath(eventId));
    await Promise.all(eventImageExtensions.map(async (extension) => {
        try {
            await unlink(getEventImageFilePath(eventId, extension));
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }));
    return readEvent(eventId);
};
