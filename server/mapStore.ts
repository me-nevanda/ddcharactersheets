import type { Map, MapData, MapGridData, MapGridElement, MapGridGroundCell, MapGridLabel, MapGridLine, MapGroundTexture, MapLineColor } from '@appTypes/map'
import { createStoredMap, deleteStoredEntity, listStoredMaps, readStoredMap, updateStoredMap } from './sqliteStore'

const safeMapIdPattern = /^[a-z0-9-]+$/i

const defaultMapGrid: MapGridData = {
  width: 34,
  height: 22,
  lines: [],
  ground: [],
  elements: [],
  labels: [],
}

const isMapLineColor = (value: unknown): value is MapLineColor => {
  return value === 'black' || value === 'red' || value === 'green' || value === 'blue' || value === 'white' || value === 'gray' || value === 'yellow' || value === 'orange' || value === 'purple'
}

const isMapGroundTexture = (value: unknown): value is MapGroundTexture => {
  return value === '1' || value === '2' || value === '3' || value === '4' || value === '5' || value === '6' || value === '7' || value === '8' || value === '9' || value === '10' || value === '11' || value === '12' || value === '13' || value === '14' || value === '15'
}

const normalizeNumber = (value: unknown): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const createLineId = (fromX: number, fromY: number, toX: number, toY: number): string => {
  return `${fromX}:${fromY}-${toX}:${toY}`
}

const createGroundCellId = (x: number, y: number): string => {
  return `${x}:${y}`
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

const normalizeMapGroundCell = (value: unknown): MapGridGroundCell | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const source = value as Partial<Record<keyof MapGridGroundCell, unknown>>
  const x = normalizeNumber(source.x)
  const y = normalizeNumber(source.y)

  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : createGroundCellId(x, y),
    x,
    y,
    texture: isMapGroundTexture(source.texture) ? source.texture : '1',
  }
}

const normalizeMapElement = (value: unknown): MapGridElement | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const source = value as Partial<Record<keyof MapGridElement, unknown>>
  const x = normalizeNumber(source.x)
  const y = normalizeNumber(source.y)

  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : createGroundCellId(x, y),
    x,
    y,
    color: isMapLineColor(source.color) ? source.color : 'black',
  }
}

const normalizeMapLabel = (value: unknown): MapGridLabel | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const source = value as Partial<Record<keyof MapGridLabel, unknown>>
  const x = normalizeNumber(source.x)
  const y = normalizeNumber(source.y)

  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : createGroundCellId(x, y),
    x,
    y,
    name: typeof source.name === 'string' ? source.name : '',
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
  const ground = Array.isArray(source.ground)
    ? source.ground.map(normalizeMapGroundCell).filter((cell): cell is MapGridGroundCell => Boolean(cell))
    : []
  const elements = Array.isArray(source.elements)
    ? source.elements.map(normalizeMapElement).filter((element): element is MapGridElement => Boolean(element))
    : []
  const labels = Array.isArray(source.labels)
    ? source.labels.map(normalizeMapLabel).filter((label): label is MapGridLabel => Boolean(label))
    : []

  return {
    width: typeof source.width === 'number' && source.width > 0 ? source.width : defaultMapGrid.width,
    height: typeof source.height === 'number' && source.height > 0 ? source.height : defaultMapGrid.height,
    lines,
    ground,
    elements,
    labels,
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
