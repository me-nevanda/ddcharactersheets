import type { Map, MapData, MapGridData, MapGridLine, MapLineColor } from '@appTypes/map'
import { createStoredMap, deleteStoredEntity, listStoredMaps, readStoredMap, updateStoredMap } from './sqliteStore'

const safeMapIdPattern = /^[a-z0-9-]+$/i

const defaultMapGrid: MapGridData = {
  width: 34,
  height: 22,
  lines: [],
}

const isMapLineColor = (value: unknown): value is MapLineColor => {
  return value === 'black' || value === 'red' || value === 'green' || value === 'blue' || value === 'white' || value === 'gray' || value === 'yellow'
}

const normalizeNumber = (value: unknown): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const createLineId = (fromX: number, fromY: number, toX: number, toY: number): string => {
  return `${fromX}:${fromY}-${toX}:${toY}`
}

const normalizeMapLine = (value: unknown): MapGridLine | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const source = value as Partial<Record<keyof MapGridLine, unknown>>
  const fromX = normalizeNumber(source.fromX)
  const fromY = normalizeNumber(source.fromY)
  const toX = normalizeNumber(source.toX)
  const toY = normalizeNumber(source.toY)

  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : createLineId(fromX, fromY, toX, toY),
    fromX,
    fromY,
    toX,
    toY,
    color: isMapLineColor(source.color) ? source.color : 'black',
  }
}

const normalizeMapGrid = (value: unknown): MapGridData => {
  if (typeof value !== 'object' || value === null) {
    return defaultMapGrid
  }

  const source = value as Partial<Record<keyof MapGridData, unknown>>
  const lines = Array.isArray(source.lines)
    ? source.lines.map(normalizeMapLine).filter((line): line is MapGridLine => Boolean(line))
    : []

  return {
    width: typeof source.width === 'number' && source.width > 0 ? source.width : defaultMapGrid.width,
    height: typeof source.height === 'number' && source.height > 0 ? source.height : defaultMapGrid.height,
    lines,
  }
}

const normalizeMap = (data: Partial<Record<keyof MapData, unknown>> = {}): MapData => {
  return {
    name: typeof data.name === 'string' ? data.name : '',
    description: typeof data.description === 'string' ? data.description : '',
    grid: normalizeMapGrid(data.grid),
  }
}

const mapStoreOptions = {
  tableName: 'maps',
  normalize: normalizeMap,
}

const ensureMapsStore = async (): Promise<void> => {}

export const isSafeMapId = (mapId: string): boolean => {
  return safeMapIdPattern.test(mapId)
}

export const listMaps = async (): Promise<Map[]> => {
  await ensureMapsStore()
  return listStoredMaps<MapData, Map>(mapStoreOptions)
}

export const readMap = async (mapId: string): Promise<Map> => {
  await ensureMapsStore()
  return readStoredMap<MapData, Map>(mapId, mapStoreOptions)
}

export const createMap = async (): Promise<Map> => {
  await ensureMapsStore()
  return createStoredMap<MapData, Map>(mapStoreOptions)
}

export const updateMap = async (mapId: string, data: unknown): Promise<Map> => {
  await ensureMapsStore()
  return updateStoredMap<MapData, Map>(mapId, data, mapStoreOptions)
}

export const deleteMap = async (mapId: string): Promise<void> => {
  await ensureMapsStore()
  await deleteStoredEntity(mapStoreOptions.tableName, mapId)
}
