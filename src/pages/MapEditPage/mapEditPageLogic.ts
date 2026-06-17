import type { MouseEvent, PointerEvent } from 'react'
import type { MapData, MapElementCategory, MapElementVariant, MapGridData, MapGridElement, MapGridGroundCell, MapGridLabel, MapGridLine, MapGroundTexture } from '@appTypes/map'
import { getElementAssetSrc } from './mapEditPageOptions'
import type { MapElementViewModel, MapGroundCellViewModel, MapLabelViewModel, MapLineOrientation, MapLineViewModel, MapPaletteColor, MapPointViewModel } from './types'

export const mapGridWidth = 34
export const mapGridHeight = 22
export const createLineId = (fromX: number, fromY: number, toX: number, toY: number): string => {
  return `${fromX}:${fromY}-${toX}:${toY}`
}

export const createPointId = (x: number, y: number): string => {
  return `${x}:${y}`
}

export const createGroundCellId = (x: number, y: number): string => {
  return `${x}:${y}`
}

export const createLine = (orientation: MapLineOrientation, x: number, y: number, color: MapPaletteColor): MapGridLine => {
  const isHorizontal = orientation === 'horizontal'
  const fromX = x
  const fromY = y
  const toX = isHorizontal ? x + 1 : x
  const toY = isHorizontal ? y : y + 1

  return {
    id: createLineId(fromX, fromY, toX, toY),
    fromX,
    fromY,
    toX,
    toY,
    color,
  }
}

export const createGroundCell = (x: number, y: number, texture: MapGroundTexture): MapGridGroundCell => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    texture,
  }
}

export const createElement = (x: number, y: number, category: MapElementCategory, variant: MapElementVariant): MapGridElement => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    category,
    variant,
  }
}

export const createLabel = (x: number, y: number, name = ''): MapGridLabel => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    name,
  }
}

export const buildGroundCells = (ground: MapGridGroundCell[]): MapGroundCellViewModel[] => {
  const activeCells = new Map(ground.map((cell) => [cell.id, cell]))
  const cells: MapGroundCellViewModel[] = []

  for (let y = 0; y < mapGridHeight; y += 1) {
    for (let x = 0; x < mapGridWidth; x += 1) {
      const id = createGroundCellId(x, y)
      const activeCell = activeCells.get(id)
      cells.push({
        id,
        active: Boolean(activeCell),
        texture: activeCell?.texture ?? '1',
        x,
        y,
      })
    }
  }

  return cells
}

export const buildElements = (elements: MapGridElement[]): MapElementViewModel[] => {
  const activeElements = new Map(elements.map((element) => [element.id, element]))
  const cells: MapElementViewModel[] = []

  for (let y = 0; y < mapGridHeight; y += 1) {
    for (let x = 0; x < mapGridWidth; x += 1) {
      const id = createGroundCellId(x, y)
      const activeElement = activeElements.get(id)
      cells.push({
        id,
        active: Boolean(activeElement),
        category: activeElement?.category ?? 'trees',
        imageSrc: getElementAssetSrc(activeElement?.category ?? 'trees', activeElement?.variant ?? '1'),
        variant: activeElement?.variant ?? '1',
        x,
        y,
      })
    }
  }

  return cells
}

export const buildLabels = (labels: MapGridLabel[]): MapLabelViewModel[] => {
  const activeLabels = new Map(labels.map((label) => [label.id, label]))
  const cells: MapLabelViewModel[] = []

  for (let y = 0; y < mapGridHeight; y += 1) {
    for (let x = 0; x < mapGridWidth; x += 1) {
      const id = createGroundCellId(x, y)
      const activeLabel = activeLabels.get(id)
      cells.push({
        id,
        active: Boolean(activeLabel),
        name: activeLabel?.name ?? '',
        x,
        y,
      })
    }
  }

  return cells
}

export const buildPointSegments = (): MapPointViewModel[] => {
  const points: MapPointViewModel[] = []

  for (let y = 0; y <= mapGridHeight; y += 1) {
    for (let x = 0; x <= mapGridWidth; x += 1) {
      points.push({
        id: createPointId(x, y),
        x,
        y,
      })
    }
  }

  return points
}

export const buildLineSegments = (lines: MapGridLine[]): MapLineViewModel[] => {
  const activeLines = new Map(lines.map((line) => [line.id, line]))
  const segments: MapLineViewModel[] = []

  for (let y = 0; y <= mapGridHeight; y += 1) {
    for (let x = 0; x < mapGridWidth; x += 1) {
      const id = createLineId(x, y, x + 1, y)
      const activeLine = activeLines.get(id)
      segments.push({
        id,
        active: Boolean(activeLine),
        color: activeLine?.color ?? 'black',
        orientation: 'horizontal',
        x,
        y,
      })
    }
  }

  for (let y = 0; y < mapGridHeight; y += 1) {
    for (let x = 0; x <= mapGridWidth; x += 1) {
      const id = createLineId(x, y, x, y + 1)
      const activeLine = activeLines.get(id)
      segments.push({
        id,
        active: Boolean(activeLine),
        color: activeLine?.color ?? 'black',
        orientation: 'vertical',
        x,
        y,
      })
    }
  }

  return segments
}

export const parseGridPointId = (pointId: string): { x: number, y: number } | null => {
  const [xValue, yValue] = pointId.split(':')
  const x = Number(xValue)
  const y = Number(yValue)

  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    return null
  }

  return { x, y }
}

export const getLineById = (lineId: string): MapLineViewModel | null => {
  const [from, to] = lineId.split('-')
  const fromPoint = parseGridPointId(from ?? '')
  const toPoint = parseGridPointId(to ?? '')

  if (!fromPoint || !toPoint) {
    return null
  }

  if (fromPoint.y === toPoint.y && toPoint.x === fromPoint.x + 1) {
    return {
      id: lineId,
      active: false,
      color: 'black',
      orientation: 'horizontal',
      x: fromPoint.x,
      y: fromPoint.y,
    }
  }

  if (fromPoint.x === toPoint.x && toPoint.y === fromPoint.y + 1) {
    return {
      id: lineId,
      active: false,
      color: 'black',
      orientation: 'vertical',
      x: fromPoint.x,
      y: fromPoint.y,
    }
  }

  return null
}

export const getPointById = (pointId: string): MapPointViewModel | null => {
  const point = parseGridPointId(pointId)

  if (!point || point.x < 0 || point.x > mapGridWidth || point.y < 0 || point.y > mapGridHeight) {
    return null
  }

  return {
    id: pointId,
    x: point.x,
    y: point.y,
  }
}

export const getGroundCellById = (cellId: string): MapGroundCellViewModel | null => {
  const point = parseGridPointId(cellId)

  if (!point || point.x < 0 || point.x >= mapGridWidth || point.y < 0 || point.y >= mapGridHeight) {
    return null
  }

  return {
    id: cellId,
    active: false,
    texture: '1',
    x: point.x,
    y: point.y,
  }
}

export const getElementById = (elementId: string): MapElementViewModel | null => {
  const point = parseGridPointId(elementId)

  if (!point || point.x < 0 || point.x >= mapGridWidth || point.y < 0 || point.y >= mapGridHeight) {
    return null
  }

  return {
    id: elementId,
    active: false,
    category: 'trees',
    imageSrc: getElementAssetSrc('trees', '1'),
    variant: '1',
    x: point.x,
    y: point.y,
  }
}

export const getLabelById = (labelId: string): MapLabelViewModel | null => {
  const point = parseGridPointId(labelId)

  if (!point || point.x < 0 || point.x >= mapGridWidth || point.y < 0 || point.y >= mapGridHeight) {
    return null
  }

  return {
    id: labelId,
    active: false,
    name: '',
    x: point.x,
    y: point.y,
  }
}

export interface MapLineDragAxis {
  orientation: MapLineOrientation
  axis: number
}

export const canDrawRange = (startLine: MapLineViewModel, endLine: MapLineViewModel): boolean => {
  if (startLine.orientation !== endLine.orientation) {
    return false
  }

  return startLine.orientation === 'horizontal'
    ? startLine.y === endLine.y
    : startLine.x === endLine.x
}

export const buildRangeLines = (startLine: MapLineViewModel, endLine: MapLineViewModel, color: MapPaletteColor): MapGridLine[] => {
  if (!canDrawRange(startLine, endLine)) {
    return []
  }

  const lines: MapGridLine[] = []

  if (startLine.orientation === 'horizontal') {
    const fromX = Math.min(startLine.x, endLine.x)
    const toX = Math.max(startLine.x, endLine.x)

    for (let x = fromX; x <= toX; x += 1) {
      lines.push(createLine('horizontal', x, startLine.y, color))
    }
    return lines
  }

  const fromY = Math.min(startLine.y, endLine.y)
  const toY = Math.max(startLine.y, endLine.y)

  for (let y = fromY; y <= toY; y += 1) {
    lines.push(createLine('vertical', startLine.x, y, color))
  }

  return lines
}

export const buildPointRangeLines = (startPoint: MapPointViewModel, endPoint: MapPointViewModel, color: MapPaletteColor): MapGridLine[] => {
  const lines: MapGridLine[] = []

  if (startPoint.y === endPoint.y) {
    const fromX = Math.min(startPoint.x, endPoint.x)
    const toX = Math.max(startPoint.x, endPoint.x)

    for (let x = fromX; x < toX; x += 1) {
      lines.push(createLine('horizontal', x, startPoint.y, color))
    }
    return lines
  }

  if (startPoint.x === endPoint.x) {
    const fromY = Math.min(startPoint.y, endPoint.y)
    const toY = Math.max(startPoint.y, endPoint.y)

    for (let y = fromY; y < toY; y += 1) {
      lines.push(createLine('vertical', startPoint.x, y, color))
    }
  }

  return lines
}

export const buildRectangleLines = (startPoint: MapPointViewModel, endPoint: MapPointViewModel, color: MapPaletteColor): MapGridLine[] => {
  const fromX = Math.min(startPoint.x, endPoint.x)
  const toX = Math.max(startPoint.x, endPoint.x)
  const fromY = Math.min(startPoint.y, endPoint.y)
  const toY = Math.max(startPoint.y, endPoint.y)

  if (fromX === toX || fromY === toY) {
    return []
  }

  const lines: MapGridLine[] = []

  for (let x = fromX; x < toX; x += 1) {
    lines.push(createLine('horizontal', x, fromY, color))
    lines.push(createLine('horizontal', x, toY, color))
  }

  for (let y = fromY; y < toY; y += 1) {
    lines.push(createLine('vertical', fromX, y, color))
    lines.push(createLine('vertical', toX, y, color))
  }

  return lines
}

export const canDrawGroundRange = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel): boolean => {
  return startCell.x === endCell.x || startCell.y === endCell.y
}

export const buildGroundRangeCells = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel, texture: MapGroundTexture): MapGridGroundCell[] => {
  if (!canDrawGroundRange(startCell, endCell)) {
    return []
  }

  const cells: MapGridGroundCell[] = []

  if (startCell.y === endCell.y) {
    const fromX = Math.min(startCell.x, endCell.x)
    const toX = Math.max(startCell.x, endCell.x)

    for (let x = fromX; x <= toX; x += 1) {
      cells.push(createGroundCell(x, startCell.y, texture))
    }
    return cells
  }

  const fromY = Math.min(startCell.y, endCell.y)
  const toY = Math.max(startCell.y, endCell.y)

  for (let y = fromY; y <= toY; y += 1) {
    cells.push(createGroundCell(startCell.x, y, texture))
  }

  return cells
}

export const buildGroundRectangleCells = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel, texture: MapGroundTexture): MapGridGroundCell[] => {
  const fromX = Math.min(startCell.x, endCell.x)
  const toX = Math.max(startCell.x, endCell.x)
  const fromY = Math.min(startCell.y, endCell.y)
  const toY = Math.max(startCell.y, endCell.y)
  const cells: MapGridGroundCell[] = []

  for (let y = fromY; y <= toY; y += 1) {
    for (let x = fromX; x <= toX; x += 1) {
      cells.push(createGroundCell(x, y, texture))
    }
  }

  return cells
}

export const replaceLines = (currentLines: MapGridLine[], nextLines: MapGridLine[]): MapGridLine[] => {
  const nextLineIds = new Set(nextLines.map((line) => line.id))
  return [...currentLines.filter((line) => !nextLineIds.has(line.id)), ...nextLines]
}

export const removeLines = (currentLines: MapGridLine[], linesToRemove: MapGridLine[]): MapGridLine[] => {
  const lineIdsToRemove = new Set(linesToRemove.map((line) => line.id))
  return currentLines.filter((line) => !lineIdsToRemove.has(line.id))
}

export const replaceGroundCells = (currentCells: MapGridGroundCell[], nextCells: MapGridGroundCell[]): MapGridGroundCell[] => {
  const nextCellIds = new Set(nextCells.map((cell) => cell.id))
  return [...currentCells.filter((cell) => !nextCellIds.has(cell.id)), ...nextCells]
}

export const removeGroundCells = (currentCells: MapGridGroundCell[], cellsToRemove: MapGridGroundCell[]): MapGridGroundCell[] => {
  const cellIdsToRemove = new Set(cellsToRemove.map((cell) => cell.id))
  return currentCells.filter((cell) => !cellIdsToRemove.has(cell.id))
}

export const replaceElements = (currentElements: MapGridElement[], nextElements: MapGridElement[]): MapGridElement[] => {
  const nextElementIds = new Set(nextElements.map((element) => element.id))
  return [...currentElements.filter((element) => !nextElementIds.has(element.id)), ...nextElements]
}

export const replaceLabels = (currentLabels: MapGridLabel[], nextLabels: MapGridLabel[]): MapGridLabel[] => {
  const nextLabelIds = new Set(nextLabels.map((label) => label.id))
  return [...currentLabels.filter((label) => !nextLabelIds.has(label.id)), ...nextLabels]
}

export const emptyMapForm: MapData = {
  name: '',
  description: '',
  grid: {
    width: mapGridWidth,
    height: mapGridHeight,
    lines: [],
    ground: [],
    elements: [],
    labels: [],
  },
}

export const undoStackLimit = 50

export const createMapUndoStorageKey = (mapId: string): string => {
  return `did:map-edit:${mapId || 'new'}:undo`
}

export const areMapGridsEqual = (firstGrid: MapGridData, secondGrid: MapGridData): boolean => {
  return JSON.stringify(firstGrid) === JSON.stringify(secondGrid)
}

export const loadMapUndoStack = (mapId: string): MapGridData[] => {
  try {
    const rawStack = window.localStorage.getItem(createMapUndoStorageKey(mapId))

    if (!rawStack) {
      return []
    }

    const parsedStack = JSON.parse(rawStack)

    return Array.isArray(parsedStack) ? parsedStack.slice(-undoStackLimit) as MapGridData[] : []
  } catch {
    return []
  }
}

export const saveMapUndoStack = (mapId: string, undoStack: MapGridData[]) => {
  try {
    window.localStorage.setItem(createMapUndoStorageKey(mapId), JSON.stringify(undoStack.slice(-undoStackLimit)))
  } catch {
    // Undo is a local convenience feature; storage failures should not block editing.
  }
}

export const clampGridCoordinate = (value: number, max: number): number => {
  return Math.min(max, Math.max(0, value))
}

export const getPointerGridPosition = (event: PointerEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const relativeX = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0
  const relativeY = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0
  const gridX = relativeX * mapGridWidth
  const gridY = relativeY * mapGridHeight
  const horizontalX = clampGridCoordinate(Math.floor(gridX), mapGridWidth - 1)
  const horizontalY = clampGridCoordinate(Math.round(gridY), mapGridHeight)
  const verticalX = clampGridCoordinate(Math.round(gridX), mapGridWidth)
  const verticalY = clampGridCoordinate(Math.floor(gridY), mapGridHeight - 1)
  const horizontalDistance = Math.abs(gridY - horizontalY)
  const verticalDistance = Math.abs(gridX - verticalX)
  const nearestLineId = horizontalDistance <= verticalDistance
    ? createLineId(horizontalX, horizontalY, horizontalX + 1, horizontalY)
    : createLineId(verticalX, verticalY, verticalX, verticalY + 1)

  return {
    cellX: clampGridCoordinate(Math.floor(gridX), mapGridWidth - 1),
    cellY: clampGridCoordinate(Math.floor(gridY), mapGridHeight - 1),
    lineId: nearestLineId,
    pointX: clampGridCoordinate(Math.round(gridX), mapGridWidth),
    pointY: clampGridCoordinate(Math.round(gridY), mapGridHeight),
  }
}

export const getMouseGridPosition = (event: MouseEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const relativeX = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0
  const relativeY = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0
  const gridX = relativeX * mapGridWidth
  const gridY = relativeY * mapGridHeight
  const horizontalX = clampGridCoordinate(Math.floor(gridX), mapGridWidth - 1)
  const horizontalY = clampGridCoordinate(Math.round(gridY), mapGridHeight)
  const verticalX = clampGridCoordinate(Math.round(gridX), mapGridWidth)
  const verticalY = clampGridCoordinate(Math.floor(gridY), mapGridHeight - 1)
  const horizontalDistance = Math.abs(gridY - horizontalY)
  const verticalDistance = Math.abs(gridX - verticalX)

  return {
    lineId: horizontalDistance <= verticalDistance
      ? createLineId(horizontalX, horizontalY, horizontalX + 1, horizontalY)
      : createLineId(verticalX, verticalY, verticalX, verticalY + 1),
  }
}

