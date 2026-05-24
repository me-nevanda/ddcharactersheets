import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Area, AreaData, PlaceItem } from '../src/types/area'

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

const normalizeUniqueId = (value: unknown): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID()
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
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: normalizeText(data.name),
    description: normalizeText(data.description),
    places: normalizePlaceItems(data.places),
  }
}

const parseArea = (rawArea: string): Partial<Record<keyof AreaData, unknown>> => {
  return JSON.parse(rawArea.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof AreaData, unknown>>
}

const ensureAreasDirectory = async (): Promise<void> => {
  await mkdir(areasDirectory, { recursive: true })
}

const getAreaFilePath = (areaId: string): string => {
  if (!isSafeAreaId(areaId)) {
    const error = new Error('Invalid area id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_AREA_ID'
    throw error
  }

  return path.join(areasDirectory, `${areaId}.json`)
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
  await ensureAreasDirectory()
  const entries = await readdir(areasDirectory, { withFileTypes: true })
  const areaFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const areas = await Promise.all(areaFiles.map(async (entry) => {
    const areaId = path.basename(entry.name, '.json')
    const filePath = getAreaFilePath(areaId)
    const [rawArea, fileInfo, imageInfo] = await Promise.all([
      readFile(filePath, 'utf8'),
      stat(filePath),
      getAreaImageInfo(areaId),
    ])

    return {
      id: areaId,
      imageUrl: imageInfo?.imageUrl ?? '',
      ...normalizeArea(parseArea(rawArea)),
      updatedAt: fileInfo.mtime.toISOString(),
    }
  }))

  return areas.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readArea = async (areaId: string): Promise<Area> => {
  await ensureAreasDirectory()
  const filePath = getAreaFilePath(areaId)
  const [rawArea, fileInfo, imageInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
    getAreaImageInfo(areaId),
  ])

  return {
    id: areaId,
    imageUrl: imageInfo?.imageUrl ?? '',
    ...normalizeArea(parseArea(rawArea)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const createArea = async (): Promise<Area> => {
  await ensureAreasDirectory()
  const areaId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getAreaFilePath(areaId)
  await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8')
  return readArea(areaId)
}

export const updateArea = async (areaId: string, data: unknown): Promise<Area> => {
  await ensureAreasDirectory()
  const filePath = getAreaFilePath(areaId)
  const rawArea = await readFile(filePath, 'utf8')
  const existingArea = parseArea(rawArea)
  const nextArea = normalizeArea({
    ...existingArea,
    ...(typeof data === 'object' && data !== null
      ? (data as Partial<Record<keyof AreaData, unknown>>)
      : {}),
  })
  await writeFile(filePath, `${JSON.stringify(nextArea, null, 2)}\n`, 'utf8')
  return readArea(areaId)
}

export const readAreaImage = async (areaId: string): Promise<AreaImage> => {
  await ensureAreasDirectory()
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
  await ensureAreasDirectory()
  await stat(getAreaFilePath(areaId))

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
  await ensureAreasDirectory()
  await stat(getAreaFilePath(areaId))

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
