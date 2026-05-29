import { readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Event, EventData } from '../src/types/event'
import { assertStoredEntityExists, createStoredEvent, deleteStoredEntity, listStoredEvents, migrateEventsJsonDirectoryToSqlite, readStoredEvent, updateStoredEvent } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

export interface EventImage {
  contentType: 'image/jpeg' | 'image/png'
  data: Buffer
}

const eventsDirectory = path.resolve(process.cwd(), 'data', 'events')
const safeEventIdPattern = /^[a-z0-9-]+$/i
const eventImageExtensions = ['jpg', 'png'] as const

const normalizeEvent = (data: Partial<Record<keyof EventData, unknown>> = {}): EventData => {
  return {
    name: typeof data.name === 'string' ? data.name : '',
    description: typeof data.description === 'string' ? data.description : '',
  }
}

const getEventImageFilePath = (eventId: string, extension: (typeof eventImageExtensions)[number]): string => {
  if (!isSafeEventId(eventId)) {
    const error = new Error('Invalid event id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_EVENT_ID'
    throw error
  }

  return path.join(eventsDirectory, `${eventId}.${extension}`)
}

const getEventImageInfo = async (eventId: string): Promise<{ contentType: EventImage['contentType']; filePath: string; imageUrl: string } | null> => {
  for (const extension of eventImageExtensions) {
    const filePath = getEventImageFilePath(eventId, extension)
    try {
      await stat(filePath)
      return {
        contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
        filePath,
        imageUrl: `/api/events/${eventId}/image`,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  return null
}

const normalizeImageExtension = (contentType: string | undefined): (typeof eventImageExtensions)[number] => {
  if (contentType === 'image/png') {
    return 'png'
  }

  if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
    return 'jpg'
  }

  const error = new Error('Invalid event image') as ApiError
  error.statusCode = 400
  error.code = 'API_INVALID_EVENT_IMAGE'
  throw error
}

const eventStoreOptions = {
  tableName: 'events',
  imageUrl: (eventId: string): string => `/api/events/${eventId}/image`,
  normalize: normalizeEvent,
}

const ensureEventsStore = async (): Promise<void> => {
  await migrateEventsJsonDirectoryToSqlite({
    directory: eventsDirectory,
    isSafeId: isSafeEventId,
  })
}

export const isSafeEventId = (eventId: string): boolean => {
  return safeEventIdPattern.test(eventId)
}

export const listEvents = async (): Promise<Event[]> => {
  await ensureEventsStore()
  const events = await listStoredEvents<EventData, Event>(eventStoreOptions)
  return Promise.all(events.map(async (event) => ({
    ...event,
    imageUrl: (await getEventImageInfo(event.id))?.imageUrl ?? '',
  })))
}

export const readEvent = async (eventId: string): Promise<Event> => {
  await ensureEventsStore()
  const [event, imageInfo] = await Promise.all([
    readStoredEvent<EventData, Event>(eventId, eventStoreOptions),
    getEventImageInfo(eventId),
  ])

  return {
    ...event,
    imageUrl: imageInfo?.imageUrl ?? '',
  }
}

export const createEvent = async (): Promise<Event> => {
  await ensureEventsStore()
  return createStoredEvent<EventData, Event>(eventStoreOptions)
}

export const updateEvent = async (eventId: string, data: unknown): Promise<Event> => {
  await ensureEventsStore()
  return updateStoredEvent<EventData, Event>(eventId, data, eventStoreOptions)
}

export const deleteEvent = async (eventId: string): Promise<void> => {
  await ensureEventsStore()
  await deleteStoredEntity(eventStoreOptions.tableName, eventId)
  await Promise.all(eventImageExtensions.map(async (extension) => {
    try {
      await unlink(getEventImageFilePath(eventId, extension))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }))
}

export const readEventImage = async (eventId: string): Promise<EventImage> => {
  await ensureEventsStore()
  const imageInfo = await getEventImageInfo(eventId)

  if (!imageInfo) {
    const error = new Error('Event image not found') as ApiError
    error.statusCode = 404
    error.code = 'ENOENT'
    throw error
  }

  return {
    contentType: imageInfo.contentType,
    data: await readFile(imageInfo.filePath),
  }
}

export const updateEventImage = async (eventId: string, contentType: string | undefined, data: Buffer): Promise<Event> => {
  await ensureEventsStore()
  await assertStoredEntityExists(eventStoreOptions.tableName, eventId)

  const extension = normalizeImageExtension(contentType)
  const nextFilePath = getEventImageFilePath(eventId, extension)
  const staleExtensions = eventImageExtensions.filter((imageExtension) => imageExtension !== extension)

  await Promise.all(staleExtensions.map(async (staleExtension) => {
    try {
      await unlink(getEventImageFilePath(eventId, staleExtension))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }))

  await writeFile(nextFilePath, data)
  return readEvent(eventId)
}

export const deleteEventImage = async (eventId: string): Promise<Event> => {
  await ensureEventsStore()
  await assertStoredEntityExists(eventStoreOptions.tableName, eventId)

  await Promise.all(eventImageExtensions.map(async (extension) => {
    try {
      await unlink(getEventImageFilePath(eventId, extension))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }))

  return readEvent(eventId)
}
