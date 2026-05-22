import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Area, AreaData, PlaceItem } from '../src/types/area'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const areasDirectory = path.resolve(process.cwd(), 'data', 'areas')
const safeAreaIdPattern = /^[a-z0-9-]+$/i

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
    const [rawArea, fileInfo] = await Promise.all([
      readFile(filePath, 'utf8'),
      stat(filePath),
    ])

    return {
      id: areaId,
      ...normalizeArea(parseArea(rawArea)),
      updatedAt: fileInfo.mtime.toISOString(),
    }
  }))

  return areas.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readArea = async (areaId: string): Promise<Area> => {
  await ensureAreasDirectory()
  const filePath = getAreaFilePath(areaId)
  const [rawArea, fileInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
  ])

  return {
    id: areaId,
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
