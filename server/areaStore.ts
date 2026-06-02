import { randomUUID } from 'node:crypto'
import { readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Area, AreaData, PlaceItem } from '../src/types/area'
import { assertStoredEntityExists, createStoredArea, deleteStoredEntity, listStoredAreas, migrateAreasJsonDirectoryToSqlite, readStoredArea, updateStoredArea } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

export interface AreaImage {
  contentType: 'image/jpeg' | 'image/png'
  data: Buffer
}

const areasDirectory = path.resolve(process.cwd(), 'data', 'areas')
const safeAreaIdPattern = /^[a-z0-9-]+$/i
const areaImageExtensions = ['jpg', 'png'] as const

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizePlaceItem = (data: Partial<Record<keyof PlaceItem, unknown>> = {}): PlaceItem => {
  return {
    id: typeof data.id === 'string' && data.id.trim().length > 0 ? data.id : randomUUID(),
    name: normalizeText(data.name),
    description: normalizeText(data.description),
  }
}

const normalizePlaceItems = (value: unknown): PlaceItem[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry) => normalizePlaceItem(typeof entry === 'object' && entry !== null ? (entry as Partial<Record<keyof PlaceItem, unknown>>) : {}))
}

const normalizeArea = (data: Partial<Record<keyof AreaData, unknown>> = {}): AreaData => {
  return {
    name: normalizeText(data.name),
    description: normalizeText(data.description),
    places: normalizePlaceItems(data.places),
  }
}

const getAreaImageFilePath = (areaId: string, extension: (typeof areaImageExtensions)[number]): string => {
  if (!isSafeAreaId(areaId)) {
    const error = new Error('Invalid area id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_AREA_ID'
    throw error
  }

  return path.join(areasDirectory, `${areaId}.${extension}`)
}

const areaTableName = 'areas'

const areaStoreOptions = {
  imageUrl: (areaId: string): string => `/api/areas/${areaId}/image`,
  normalize: normalizeArea,
}

const ensureAreasStore = async (): Promise<void> => {
  await migrateAreasJsonDirectoryToSqlite({
    directory: areasDirectory,
    isSafeId: isSafeAreaId,
  })
}

const getAreaImageInfo = async (areaId: string): Promise<{ contentType: AreaImage['contentType']; filePath: string; imageUrl: string } | null> => {
  for (const extension of areaImageExtensions) {
    const filePath = getAreaImageFilePath(areaId, extension)

    try {
      await stat(filePath)
      return {
        contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
        filePath,
        imageUrl: `/api/areas/${areaId}/image`,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  return null
}

const normalizeImageExtension = (contentType: string | undefined): (typeof areaImageExtensions)[number] => {
  if (contentType === 'image/png') {
    return 'png'
  }

  if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
    return 'jpg'
  }

  const error = new Error('Invalid area image') as ApiError
  error.statusCode = 400
  error.code = 'API_INVALID_AREA_IMAGE'
  throw error
}

export const isSafeAreaId = (areaId: string): boolean => {
  return safeAreaIdPattern.test(areaId)
}

export const listAreas = async (): Promise<Area[]> => {
  await ensureAreasStore()
  const areas = await listStoredAreas<AreaData, Area>(areaStoreOptions)
  return Promise.all(areas.map(async (area) => ({
    ...area,
    imageUrl: (await getAreaImageInfo(area.id))?.imageUrl ?? '',
  })))
}

export const readArea = async (areaId: string): Promise<Area> => {
  await ensureAreasStore()
  const [area, imageInfo] = await Promise.all([
    readStoredArea<AreaData, Area>(areaId, areaStoreOptions),
    getAreaImageInfo(areaId),
  ])
  return {
    ...area,
    imageUrl: imageInfo?.imageUrl ?? '',
  }
}

export const createArea = async (): Promise<Area> => {
  await ensureAreasStore()
  return createStoredArea<AreaData, Area>(areaStoreOptions)
}

export const updateArea = async (areaId: string, data: unknown): Promise<Area> => {
  await ensureAreasStore()
  return updateStoredArea<AreaData, Area>(areaId, data, areaStoreOptions)
}

export const deleteArea = async (areaId: string): Promise<void> => {
  await ensureAreasStore()
  await deleteStoredEntity(areaTableName, areaId)
  await Promise.all(
    areaImageExtensions.map(async (extension) => {
      try {
        await unlink(getAreaImageFilePath(areaId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )
}

export const readAreaImage = async (areaId: string): Promise<AreaImage> => {
  await ensureAreasStore()
  const imageInfo = await getAreaImageInfo(areaId)

  if (!imageInfo) {
    const error = new Error('Area image not found') as ApiError
    error.statusCode = 404
    error.code = 'ENOENT'
    throw error
  }

  return {
    contentType: imageInfo.contentType,
    data: await readFile(imageInfo.filePath),
  }
}

export const updateAreaImage = async (areaId: string, contentType: string | undefined, data: Buffer): Promise<Area> => {
  await ensureAreasStore()
  await assertStoredEntityExists(areaTableName, areaId)

  const extension = normalizeImageExtension(contentType)
  const nextFilePath = getAreaImageFilePath(areaId, extension)
  const staleExtensions = areaImageExtensions.filter((imageExtension) => imageExtension !== extension)

  await Promise.all(
    staleExtensions.map(async (staleExtension) => {
      try {
        await unlink(getAreaImageFilePath(areaId, staleExtension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  await writeFile(nextFilePath, data)

  return readArea(areaId)
}

export const deleteAreaImage = async (areaId: string): Promise<Area> => {
  await ensureAreasStore()
  await assertStoredEntityExists(areaTableName, areaId)

  await Promise.all(
    areaImageExtensions.map(async (extension) => {
      try {
        await unlink(getAreaImageFilePath(areaId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  return readArea(areaId)
}
