import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMap, saveMap } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { MapData, MapElementCategory, MapElementVariant, MapGridElement, MapGridGroundCell, MapGridLabel, MapGridLine, MapGroundTexture } from '@appTypes/map'
import bushElement1 from '../../images/elements/bushes/1.png'
import bushElement2 from '../../images/elements/bushes/2.png'
import bushElement3 from '../../images/elements/bushes/3.png'
import bushElement4 from '../../images/elements/bushes/4.png'
import bushElement5 from '../../images/elements/bushes/5.png'
import bushElement6 from '../../images/elements/bushes/6.png'
import bushElement7 from '../../images/elements/bushes/7.png'
import bushElement8 from '../../images/elements/bushes/8.png'
import treeElement1 from '../../images/elements/trees/1.png'
import treeElement2 from '../../images/elements/trees/2.png'
import treeElement3 from '../../images/elements/trees/3.png'
import treeElement4 from '../../images/elements/trees/4.png'
import treeElement5 from '../../images/elements/trees/5.png'
import treeElement6 from '../../images/elements/trees/6.png'
import stairElement1 from '../../images/elements/stairs/1.png'
import stairElement2 from '../../images/elements/stairs/2.png'
import stairElement3 from '../../images/elements/stairs/3.png'
import stairElement4 from '../../images/elements/stairs/4.png'
import stairElement5 from '../../images/elements/stairs/5.png'
import stairElement6 from '../../images/elements/stairs/6.png'
import stairElement7 from '../../images/elements/stairs/7.png'
import stairElement8 from '../../images/elements/stairs/8.png'
import furnitureElement1 from '../../images/elements/furnitures/1.png'
import furnitureElement2 from '../../images/elements/furnitures/2.png'
import furnitureElement3 from '../../images/elements/furnitures/3.png'
import furnitureElement4 from '../../images/elements/furnitures/4.png'
import furnitureElement5 from '../../images/elements/furnitures/5.png'
import furnitureElement6 from '../../images/elements/furnitures/6.png'
import furnitureElement7 from '../../images/elements/furnitures/7.png'
import furnitureElement8 from '../../images/elements/furnitures/8.png'
import furnitureElement9 from '../../images/elements/furnitures/9.png'
import miscElement1 from '../../images/elements/misc/1.png'
import miscElement2 from '../../images/elements/misc/2.png'
import miscElement3 from '../../images/elements/misc/3.png'
import miscElement4 from '../../images/elements/misc/4.png'
import miscElement5 from '../../images/elements/misc/5.png'
import miscElement6 from '../../images/elements/misc/6.png'
import miscElement7 from '../../images/elements/misc/7.png'
import miscElement8 from '../../images/elements/misc/8.png'
import miscElement9 from '../../images/elements/misc/9.png'
import miscElement10 from '../../images/elements/misc/10.png'
import groundTexture1 from '../../images/grounds/1.png'
import groundTexture2 from '../../images/grounds/2.png'
import groundTexture3 from '../../images/grounds/3.png'
import groundTexture4 from '../../images/grounds/4.png'
import groundTexture5 from '../../images/grounds/5.png'
import groundTexture6 from '../../images/grounds/6.png'
import groundTexture7 from '../../images/grounds/7.png'
import groundTexture8 from '../../images/grounds/8.png'
import groundTexture9 from '../../images/grounds/9.png'
import groundTexture10 from '../../images/grounds/10.png'
import groundTexture11 from '../../images/grounds/11.png'
import groundTexture12 from '../../images/grounds/12.png'
import groundTexture13 from '../../images/grounds/13.png'
import groundTexture14 from '../../images/grounds/14.png'
import groundTexture15 from '../../images/grounds/15.png'
import type { MapDrawMode, MapDrawModeOption, MapEditPageState, MapElementAssetOption, MapElementViewModel, MapGroundCellViewModel, MapGroundTextureOption, MapLabelViewModel, MapLayer, MapLayerOption, MapLineOrientation, MapLineViewModel, MapPaletteColor, MapPaletteColorOption, MapPointViewModel } from './types'

const mapGridWidth = 34
const mapGridHeight = 22

const colorOptions: MapPaletteColorOption[] = [
  { key: 'black', labelKey: 'pages.mapEdit.colors.black' },
  { key: 'red', labelKey: 'pages.mapEdit.colors.red' },
  { key: 'green', labelKey: 'pages.mapEdit.colors.green' },
  { key: 'blue', labelKey: 'pages.mapEdit.colors.blue' },
  { key: 'white', labelKey: 'pages.mapEdit.colors.white' },
  { key: 'gray', labelKey: 'pages.mapEdit.colors.gray' },
  { key: 'yellow', labelKey: 'pages.mapEdit.colors.yellow' },
  { key: 'orange', labelKey: 'pages.mapEdit.colors.orange' },
  { key: 'purple', labelKey: 'pages.mapEdit.colors.purple' },
  { key: 'brown', labelKey: 'pages.mapEdit.colors.brown' },
  { key: 'tortoise', labelKey: 'pages.mapEdit.colors.tortoise' },
  { key: 'pink', labelKey: 'pages.mapEdit.colors.pink' },
]

const groundTextureOptions: MapGroundTextureOption[] = [
  { key: '1', imageSrc: groundTexture1 },
  { key: '2', imageSrc: groundTexture2 },
  { key: '3', imageSrc: groundTexture3 },
  { key: '4', imageSrc: groundTexture4 },
  { key: '5', imageSrc: groundTexture5 },
  { key: '6', imageSrc: groundTexture6 },
  { key: '7', imageSrc: groundTexture7 },
  { key: '8', imageSrc: groundTexture8 },
  { key: '9', imageSrc: groundTexture9 },
  { key: '10', imageSrc: groundTexture10 },
  { key: '11', imageSrc: groundTexture11 },
  { key: '12', imageSrc: groundTexture12 },
  { key: '13', imageSrc: groundTexture13 },
  { key: '14', imageSrc: groundTexture14 },
  { key: '15', imageSrc: groundTexture15 },
]

const elementAssetOptions: MapElementAssetOption[] = [
  { category: 'trees', variant: '1', imageSrc: treeElement1 },
  { category: 'trees', variant: '2', imageSrc: treeElement2 },
  { category: 'trees', variant: '3', imageSrc: treeElement3 },
  { category: 'trees', variant: '4', imageSrc: treeElement4 },
  { category: 'trees', variant: '5', imageSrc: treeElement5 },
  { category: 'trees', variant: '6', imageSrc: treeElement6 },
  { category: 'bushes', variant: '1', imageSrc: bushElement1 },
  { category: 'bushes', variant: '2', imageSrc: bushElement2 },
  { category: 'bushes', variant: '3', imageSrc: bushElement3 },
  { category: 'bushes', variant: '4', imageSrc: bushElement4 },
  { category: 'bushes', variant: '5', imageSrc: bushElement5 },
  { category: 'bushes', variant: '6', imageSrc: bushElement6 },
  { category: 'bushes', variant: '7', imageSrc: bushElement7 },
  { category: 'bushes', variant: '8', imageSrc: bushElement8 },
  { category: 'stairs', variant: '1', imageSrc: stairElement1 },
  { category: 'stairs', variant: '2', imageSrc: stairElement2 },
  { category: 'stairs', variant: '3', imageSrc: stairElement3 },
  { category: 'stairs', variant: '4', imageSrc: stairElement4 },
  { category: 'stairs', variant: '5', imageSrc: stairElement5 },
  { category: 'stairs', variant: '6', imageSrc: stairElement6 },
  { category: 'stairs', variant: '7', imageSrc: stairElement7 },
  { category: 'stairs', variant: '8', imageSrc: stairElement8 },
  { category: 'furnitures', variant: '1', imageSrc: furnitureElement1 },
  { category: 'furnitures', variant: '2', imageSrc: furnitureElement2 },
  { category: 'furnitures', variant: '3', imageSrc: furnitureElement3 },
  { category: 'furnitures', variant: '4', imageSrc: furnitureElement4 },
  { category: 'furnitures', variant: '5', imageSrc: furnitureElement5 },
  { category: 'furnitures', variant: '6', imageSrc: furnitureElement6 },
  { category: 'furnitures', variant: '7', imageSrc: furnitureElement7 },
  { category: 'furnitures', variant: '8', imageSrc: furnitureElement8 },
  { category: 'furnitures', variant: '9', imageSrc: furnitureElement9 },
  { category: 'misc', variant: '1', imageSrc: miscElement1 },
  { category: 'misc', variant: '2', imageSrc: miscElement2 },
  { category: 'misc', variant: '3', imageSrc: miscElement3 },
  { category: 'misc', variant: '4', imageSrc: miscElement4 },
  { category: 'misc', variant: '5', imageSrc: miscElement5 },
  { category: 'misc', variant: '6', imageSrc: miscElement6 },
  { category: 'misc', variant: '7', imageSrc: miscElement7 },
  { category: 'misc', variant: '8', imageSrc: miscElement8 },
  { category: 'misc', variant: '9', imageSrc: miscElement9 },
  { category: 'misc', variant: '10', imageSrc: miscElement10 },
]

const elementCategories: MapElementCategory[] = ['trees', 'bushes', 'stairs', 'furnitures', 'misc']

const getElementAssetSrc = (category: MapElementCategory, variant: MapElementVariant): string => {
  return elementAssetOptions.find((option) => option.category === category && option.variant === variant)?.imageSrc ?? elementAssetOptions.find((option) => option.category === category)?.imageSrc ?? ''
}

const drawModeOptions: MapDrawModeOption[] = [
  { key: 'single', labelKey: 'pages.mapEdit.drawModes.single' },
  { key: 'range', labelKey: 'pages.mapEdit.drawModes.range' },
  { key: 'rectangle', labelKey: 'pages.mapEdit.drawModes.rectangle' },
]

const layerOptions: MapLayerOption[] = [
  { key: 'lines', labelKey: 'pages.mapEdit.layers.lines' },
  { key: 'ground', labelKey: 'pages.mapEdit.layers.ground' },
  { key: 'elements', labelKey: 'pages.mapEdit.layers.elements' },
  { key: 'labels', labelKey: 'pages.mapEdit.layers.labels' },
]

const createLineId = (fromX: number, fromY: number, toX: number, toY: number): string => {
  return `${fromX}:${fromY}-${toX}:${toY}`
}

const createPointId = (x: number, y: number): string => {
  return `${x}:${y}`
}

const createGroundCellId = (x: number, y: number): string => {
  return `${x}:${y}`
}

const createLine = (orientation: MapLineOrientation, x: number, y: number, color: MapPaletteColor): MapGridLine => {
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

const createGroundCell = (x: number, y: number, texture: MapGroundTexture): MapGridGroundCell => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    texture,
  }
}

const createElement = (x: number, y: number, category: MapElementCategory, variant: MapElementVariant): MapGridElement => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    category,
    variant,
  }
}

const createLabel = (x: number, y: number, name = ''): MapGridLabel => {
  return {
    id: createGroundCellId(x, y),
    x,
    y,
    name,
  }
}

const buildGroundCells = (ground: MapGridGroundCell[]): MapGroundCellViewModel[] => {
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

const buildElements = (elements: MapGridElement[]): MapElementViewModel[] => {
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

const buildLabels = (labels: MapGridLabel[]): MapLabelViewModel[] => {
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

const buildPointSegments = (): MapPointViewModel[] => {
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

const buildLineSegments = (lines: MapGridLine[]): MapLineViewModel[] => {
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

const getLineById = (lineId: string): MapLineViewModel | null => {
  return buildLineSegments([]).find((line) => line.id === lineId) ?? null
}

const getPointById = (pointId: string): MapPointViewModel | null => {
  return buildPointSegments().find((point) => point.id === pointId) ?? null
}

const getGroundCellById = (cellId: string): MapGroundCellViewModel | null => {
  return buildGroundCells([]).find((cell) => cell.id === cellId) ?? null
}

const getElementById = (elementId: string): MapElementViewModel | null => {
  return buildElements([]).find((element) => element.id === elementId) ?? null
}

const getLabelById = (labelId: string): MapLabelViewModel | null => {
  return buildLabels([]).find((label) => label.id === labelId) ?? null
}

const canDrawRange = (startLine: MapLineViewModel, endLine: MapLineViewModel): boolean => {
  if (startLine.orientation !== endLine.orientation) {
    return false
  }

  return startLine.orientation === 'horizontal'
    ? startLine.y === endLine.y
    : startLine.x === endLine.x
}

const buildRangeLines = (startLine: MapLineViewModel, endLine: MapLineViewModel, color: MapPaletteColor): MapGridLine[] => {
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

const buildPointRangeLines = (startPoint: MapPointViewModel, endPoint: MapPointViewModel, color: MapPaletteColor): MapGridLine[] => {
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

const buildRectangleLines = (startPoint: MapPointViewModel, endPoint: MapPointViewModel, color: MapPaletteColor): MapGridLine[] => {
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

const canDrawGroundRange = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel): boolean => {
  return startCell.x === endCell.x || startCell.y === endCell.y
}

const buildGroundRangeCells = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel, texture: MapGroundTexture): MapGridGroundCell[] => {
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

const buildGroundRectangleCells = (startCell: MapGroundCellViewModel, endCell: MapGroundCellViewModel, texture: MapGroundTexture): MapGridGroundCell[] => {
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

const replaceLines = (currentLines: MapGridLine[], nextLines: MapGridLine[]): MapGridLine[] => {
  const nextLineIds = new Set(nextLines.map((line) => line.id))
  return [...currentLines.filter((line) => !nextLineIds.has(line.id)), ...nextLines]
}

const removeLines = (currentLines: MapGridLine[], linesToRemove: MapGridLine[]): MapGridLine[] => {
  const lineIdsToRemove = new Set(linesToRemove.map((line) => line.id))
  return currentLines.filter((line) => !lineIdsToRemove.has(line.id))
}

const replaceGroundCells = (currentCells: MapGridGroundCell[], nextCells: MapGridGroundCell[]): MapGridGroundCell[] => {
  const nextCellIds = new Set(nextCells.map((cell) => cell.id))
  return [...currentCells.filter((cell) => !nextCellIds.has(cell.id)), ...nextCells]
}

const removeGroundCells = (currentCells: MapGridGroundCell[], cellsToRemove: MapGridGroundCell[]): MapGridGroundCell[] => {
  const cellIdsToRemove = new Set(cellsToRemove.map((cell) => cell.id))
  return currentCells.filter((cell) => !cellIdsToRemove.has(cell.id))
}

const replaceElements = (currentElements: MapGridElement[], nextElements: MapGridElement[]): MapGridElement[] => {
  const nextElementIds = new Set(nextElements.map((element) => element.id))
  return [...currentElements.filter((element) => !nextElementIds.has(element.id)), ...nextElements]
}

const replaceLabels = (currentLabels: MapGridLabel[], nextLabels: MapGridLabel[]): MapGridLabel[] => {
  const nextLabelIds = new Set(nextLabels.map((label) => label.id))
  return [...currentLabels.filter((label) => !nextLabelIds.has(label.id)), ...nextLabels]
}

const emptyMapForm: MapData = {
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

export const useMapEditPage = (): MapEditPageState => {
  const { t } = useI18n()
  const { mapId = '' } = useParams()
  const [form, setForm] = useState<MapData>(emptyMapForm)
  const [initialForm, setInitialForm] = useState<MapData>(emptyMapForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLayer, setActiveLayer] = useState<MapLayer>('lines')
  const [selectedColor, setSelectedColor] = useState<MapPaletteColor>('black')
  const [selectedGroundTexture, setSelectedGroundTexture] = useState<MapGroundTexture>('1')
  const [selectedElementCategory, setSelectedElementCategory] = useState<MapElementCategory>('trees')
  const [selectedElementVariantByCategory, setSelectedElementVariantByCategory] = useState<Record<MapElementCategory, MapElementVariant>>({
    trees: '1',
    bushes: '1',
    stairs: '1',
    furnitures: '1',
    misc: '1',
  })
  const [selectedDrawMode, setSelectedDrawMode] = useState<MapDrawMode>('single')
  const [selectedRangeStartId, setSelectedRangeStartId] = useState('')
  const [previewRangeEndId, setPreviewRangeEndId] = useState('')
  const [selectedEraseRangeStartId, setSelectedEraseRangeStartId] = useState('')
  const [previewEraseRangeEndId, setPreviewEraseRangeEndId] = useState('')
  const [selectedRectangleStartId, setSelectedRectangleStartId] = useState('')
  const [previewRectangleEndId, setPreviewRectangleEndId] = useState('')
  const [selectedPointRangeStartId, setSelectedPointRangeStartId] = useState('')
  const [previewPointRangeEndId, setPreviewPointRangeEndId] = useState('')
  const [selectedPointEraseStartId, setSelectedPointEraseStartId] = useState('')
  const [previewPointEraseEndId, setPreviewPointEraseEndId] = useState('')
  const [selectedGroundRangeStartId, setSelectedGroundRangeStartId] = useState('')
  const [previewGroundRangeEndId, setPreviewGroundRangeEndId] = useState('')
  const [selectedEraseGroundRangeStartId, setSelectedEraseGroundRangeStartId] = useState('')
  const [previewEraseGroundRangeEndId, setPreviewEraseGroundRangeEndId] = useState('')
  const [selectedGroundRectangleStartId, setSelectedGroundRectangleStartId] = useState('')
  const [previewGroundRectangleEndId, setPreviewGroundRectangleEndId] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMap = async () => {
      try {
        const map = await getMap(mapId)
        const nextForm: MapData = {
          name: map.name,
          description: map.description,
          grid: map.grid,
        }

        if (!cancelled) {
          setForm(nextForm)
          setInitialForm(nextForm)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadMap()

    return () => {
      cancelled = true
    }
  }, [mapId, t])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleToggleLine = (lineId: string) => {
    const lineSegment = getLineById(lineId)

    if (!lineSegment) {
      return
    }

    if (selectedDrawMode === 'range' || selectedDrawMode === 'rectangle') {
      return
    }

    setForm((current) => {
      const nextLine = createLine(lineSegment.orientation, lineSegment.x, lineSegment.y, selectedColor)
      const nextLines = replaceLines(current.grid.lines, [nextLine])

      return {
        ...current,
        grid: {
          ...current.grid,
          lines: nextLines,
        },
      }
    })
  }

  const handleRemoveLine: MapEditPageState['handleRemoveLine'] = (lineId, event) => {
    event?.preventDefault()
    const lineSegment = getLineById(lineId)

    if (!lineSegment) {
      return
    }

    if (selectedDrawMode === 'range') {
      if (!selectedEraseRangeStartId) {
        setSelectedEraseRangeStartId(lineId)
        setSelectedRangeStartId('')
        setPreviewRangeEndId('')
        setSelectedRectangleStartId('')
        setPreviewRectangleEndId('')
        return
      }

      const startLine = getLineById(selectedEraseRangeStartId)

      if (!startLine || !canDrawRange(startLine, lineSegment)) {
        setSelectedEraseRangeStartId(lineId)
        return
      }

      const nextRangeLines = buildRangeLines(startLine, lineSegment, selectedColor)
      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          lines: removeLines(current.grid.lines, nextRangeLines),
        },
      }))
      setSelectedEraseRangeStartId('')
      setPreviewEraseRangeEndId('')
      return
    }

    setSelectedRangeStartId('')
    setPreviewRangeEndId('')
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        lines: current.grid.lines.filter((line) => line.id !== lineId),
      },
    }))
  }

  const handleSelectDrawMode = (mode: MapDrawMode) => {
    setSelectedDrawMode(mode)
    setSelectedRangeStartId('')
    setPreviewRangeEndId('')
    setSelectedEraseRangeStartId('')
    setPreviewEraseRangeEndId('')
    setSelectedRectangleStartId('')
    setPreviewRectangleEndId('')
    setSelectedPointRangeStartId('')
    setPreviewPointRangeEndId('')
    setSelectedPointEraseStartId('')
    setPreviewPointEraseEndId('')
    setSelectedGroundRangeStartId('')
    setPreviewGroundRangeEndId('')
    setSelectedEraseGroundRangeStartId('')
    setPreviewEraseGroundRangeEndId('')
    setSelectedGroundRectangleStartId('')
    setPreviewGroundRectangleEndId('')
  }

  const handleSelectLayer = (layer: MapLayer) => {
    setActiveLayer(layer)
    setSelectedRangeStartId('')
    setPreviewRangeEndId('')
    setSelectedEraseRangeStartId('')
    setPreviewEraseRangeEndId('')
    setSelectedRectangleStartId('')
    setPreviewRectangleEndId('')
    setSelectedPointRangeStartId('')
    setPreviewPointRangeEndId('')
    setSelectedPointEraseStartId('')
    setPreviewPointEraseEndId('')
    setSelectedGroundRangeStartId('')
    setPreviewGroundRangeEndId('')
    setSelectedEraseGroundRangeStartId('')
    setPreviewEraseGroundRangeEndId('')
    setSelectedGroundRectangleStartId('')
    setPreviewGroundRectangleEndId('')
  }

  const handleSelectElementAsset = (category: MapElementCategory, variant: MapElementVariant) => {
    setSelectedElementCategory(category)
    setSelectedElementVariantByCategory((current) => ({
      ...current,
      [category]: variant,
    }))
  }

  const handlePreviewLine = (lineId: string) => {
    if (selectedDrawMode !== 'range' || !selectedRangeStartId) {
      if (selectedDrawMode === 'range' && selectedEraseRangeStartId) {
        setPreviewEraseRangeEndId(lineId)
      }
      return
    }

    setPreviewRangeEndId(lineId)
  }

  const handleClearLinePreview = () => {
    setPreviewRangeEndId('')
    setPreviewEraseRangeEndId('')
    setPreviewRectangleEndId('')
    setPreviewPointRangeEndId('')
    setPreviewPointEraseEndId('')
    setPreviewGroundRangeEndId('')
    setPreviewEraseGroundRangeEndId('')
    setPreviewGroundRectangleEndId('')
  }

  const handleSelectPoint = (pointId: string) => {
    if (selectedDrawMode !== 'range' && selectedDrawMode !== 'rectangle') {
      return
    }

    if (selectedDrawMode === 'range') {
      if (!selectedPointRangeStartId) {
        setSelectedPointRangeStartId(pointId)
        setSelectedRangeStartId('')
        setPreviewRangeEndId('')
        setSelectedEraseRangeStartId('')
        setPreviewEraseRangeEndId('')
        setSelectedPointEraseStartId('')
        setPreviewPointEraseEndId('')
        setSelectedRectangleStartId('')
        setPreviewRectangleEndId('')
        return
      }

      const startPoint = getPointById(selectedPointRangeStartId)
      const endPoint = getPointById(pointId)

      if (!startPoint || !endPoint) {
        setSelectedPointRangeStartId(pointId)
        return
      }

      const nextRangeLines = buildPointRangeLines(startPoint, endPoint, selectedColor)

      if (nextRangeLines.length === 0) {
        setSelectedPointRangeStartId(pointId)
        return
      }

      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          lines: replaceLines(current.grid.lines, nextRangeLines),
        },
      }))
      setSelectedPointRangeStartId('')
      setPreviewPointRangeEndId('')
      setSelectedPointEraseStartId('')
      setPreviewPointEraseEndId('')
      return
    }

    if (!selectedRectangleStartId) {
      setSelectedRectangleStartId(pointId)
      setSelectedPointRangeStartId('')
      setPreviewPointRangeEndId('')
      setSelectedPointEraseStartId('')
      setPreviewPointEraseEndId('')
      setSelectedRangeStartId('')
      setPreviewRangeEndId('')
      setSelectedEraseRangeStartId('')
      setPreviewEraseRangeEndId('')
      return
    }

    const startPoint = getPointById(selectedRectangleStartId)
    const endPoint = getPointById(pointId)

    if (!startPoint || !endPoint) {
      setSelectedRectangleStartId(pointId)
      return
    }

    const nextRectangleLines = buildRectangleLines(startPoint, endPoint, selectedColor)

    if (nextRectangleLines.length === 0) {
      setSelectedRectangleStartId(pointId)
      return
    }

    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        lines: replaceLines(current.grid.lines, nextRectangleLines),
      },
    }))
    setSelectedRectangleStartId('')
    setPreviewRectangleEndId('')
  }

  const handleRemovePoint: MapEditPageState['handleRemovePoint'] = (pointId, event) => {
    event?.preventDefault()

    if (selectedDrawMode !== 'range') {
      return
    }

    if (!selectedPointEraseStartId) {
      setSelectedPointEraseStartId(pointId)
      setSelectedPointRangeStartId('')
      setPreviewPointRangeEndId('')
      setSelectedRangeStartId('')
      setPreviewRangeEndId('')
      setSelectedEraseRangeStartId('')
      setPreviewEraseRangeEndId('')
      setSelectedRectangleStartId('')
      setPreviewRectangleEndId('')
      return
    }

    const startPoint = getPointById(selectedPointEraseStartId)
    const endPoint = getPointById(pointId)

    if (!startPoint || !endPoint) {
      setSelectedPointEraseStartId(pointId)
      return
    }

    const nextRangeLines = buildPointRangeLines(startPoint, endPoint, selectedColor)

    if (nextRangeLines.length === 0) {
      setSelectedPointEraseStartId(pointId)
      return
    }

    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        lines: removeLines(current.grid.lines, nextRangeLines),
      },
    }))
    setSelectedPointEraseStartId('')
    setPreviewPointEraseEndId('')
  }

  const handleToggleGroundCell = (cellId: string) => {
    const groundCell = getGroundCellById(cellId)

    if (!groundCell) {
      return
    }

    if (selectedDrawMode === 'single') {
      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          ground: replaceGroundCells(current.grid.ground, [createGroundCell(groundCell.x, groundCell.y, selectedGroundTexture)]),
        },
      }))
      return
    }

    if (selectedDrawMode === 'range') {
      if (!selectedGroundRangeStartId) {
        setSelectedGroundRangeStartId(cellId)
        setSelectedEraseGroundRangeStartId('')
        setPreviewEraseGroundRangeEndId('')
        setSelectedGroundRectangleStartId('')
        setPreviewGroundRectangleEndId('')
        return
      }

      const startCell = getGroundCellById(selectedGroundRangeStartId)

      if (!startCell || !canDrawGroundRange(startCell, groundCell)) {
        setSelectedGroundRangeStartId(cellId)
        return
      }

      const nextGroundCells = buildGroundRangeCells(startCell, groundCell, selectedGroundTexture)
      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          ground: replaceGroundCells(current.grid.ground, nextGroundCells),
        },
      }))
      setSelectedGroundRangeStartId('')
      setPreviewGroundRangeEndId('')
      return
    }

    if (!selectedGroundRectangleStartId) {
      setSelectedGroundRectangleStartId(cellId)
      setSelectedGroundRangeStartId('')
      setPreviewGroundRangeEndId('')
      setSelectedEraseGroundRangeStartId('')
      setPreviewEraseGroundRangeEndId('')
      return
    }

    const startCell = getGroundCellById(selectedGroundRectangleStartId)

    if (!startCell) {
      setSelectedGroundRectangleStartId(cellId)
      return
    }

    const nextGroundCells = buildGroundRectangleCells(startCell, groundCell, selectedGroundTexture)
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        ground: replaceGroundCells(current.grid.ground, nextGroundCells),
      },
    }))
    setSelectedGroundRectangleStartId('')
    setPreviewGroundRectangleEndId('')
  }

  const handleRemoveGroundCell: MapEditPageState['handleRemoveGroundCell'] = (cellId, event) => {
    event?.preventDefault()
    const groundCell = getGroundCellById(cellId)

    if (!groundCell) {
      return
    }

    if (selectedDrawMode === 'range') {
      if (!selectedEraseGroundRangeStartId) {
        setSelectedEraseGroundRangeStartId(cellId)
        setSelectedGroundRangeStartId('')
        setPreviewGroundRangeEndId('')
        setSelectedGroundRectangleStartId('')
        setPreviewGroundRectangleEndId('')
        return
      }

      const startCell = getGroundCellById(selectedEraseGroundRangeStartId)

      if (!startCell || !canDrawGroundRange(startCell, groundCell)) {
        setSelectedEraseGroundRangeStartId(cellId)
        return
      }

      const nextGroundCells = buildGroundRangeCells(startCell, groundCell, selectedGroundTexture)
      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          ground: removeGroundCells(current.grid.ground, nextGroundCells),
        },
      }))
      setSelectedEraseGroundRangeStartId('')
      setPreviewEraseGroundRangeEndId('')
      return
    }

    setSelectedGroundRangeStartId('')
    setPreviewGroundRangeEndId('')
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        ground: current.grid.ground.filter((cell) => cell.id !== cellId),
      },
    }))
  }

  const handlePreviewPoint = (pointId: string) => {
    if (selectedDrawMode === 'range' && selectedPointEraseStartId) {
      setPreviewPointEraseEndId(pointId)
      return
    }

    if (selectedDrawMode === 'range' && selectedPointRangeStartId) {
      setPreviewPointRangeEndId(pointId)
      return
    }

    if (selectedDrawMode === 'rectangle' && selectedRectangleStartId) {
      setPreviewRectangleEndId(pointId)
    }
  }

  const handlePreviewGroundCell = (cellId: string) => {
    if (selectedDrawMode === 'range' && selectedEraseGroundRangeStartId) {
      setPreviewEraseGroundRangeEndId(cellId)
      return
    }

    if (selectedDrawMode === 'range' && selectedGroundRangeStartId) {
      setPreviewGroundRangeEndId(cellId)
      return
    }

    if (selectedDrawMode === 'rectangle' && selectedGroundRectangleStartId) {
      setPreviewGroundRectangleEndId(cellId)
    }
  }

  const handleToggleElement = (elementId: string) => {
    const element = getElementById(elementId)

    if (!element) {
      return
    }

    setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          elements: replaceElements(current.grid.elements, [createElement(element.x, element.y, selectedElementCategory, selectedElementVariantByCategory[selectedElementCategory])]),
        },
      }))
  }

  const handleRemoveElement: MapEditPageState['handleRemoveElement'] = (elementId, event) => {
    event?.preventDefault()
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        elements: current.grid.elements.filter((element) => element.id !== elementId),
      },
    }))
  }

  const handleToggleLabel = (labelId: string) => {
    const label = getLabelById(labelId)

    if (!label) {
      return
    }

    setForm((current) => {
      const existingLabel = current.grid.labels.find((currentLabel) => currentLabel.id === labelId)

      return {
        ...current,
        grid: {
          ...current.grid,
          labels: replaceLabels(current.grid.labels, [createLabel(label.x, label.y, existingLabel?.name)]),
        },
      }
    })
  }

  const handleRemoveLabel: MapEditPageState['handleRemoveLabel'] = (labelId, event) => {
    event?.preventDefault()
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        labels: current.grid.labels.filter((label) => label.id !== labelId),
      },
    }))
  }

  const handleRenameLabel: MapEditPageState['handleRenameLabel'] = (labelId, name) => {
    setForm((current) => ({
      ...current,
      grid: {
        ...current.grid,
        labels: current.grid.labels.map((label) => (
          label.id === labelId
            ? { ...label, name: name.trim() }
            : label
        )),
      },
    }))
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const nextForm: MapData = {
        name: form.name.trim(),
        description: form.description.trim(),
        grid: form.grid,
      }
      await saveMap(mapId, nextForm)
      setForm(nextForm)
      setInitialForm(nextForm)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const startPreviewLine = selectedRangeStartId ? getLineById(selectedRangeStartId) : null
  const endPreviewLine = previewRangeEndId ? getLineById(previewRangeEndId) : null
  const previewLineIds = startPreviewLine && endPreviewLine
    ? buildRangeLines(startPreviewLine, endPreviewLine, selectedColor).map((line) => line.id)
    : []
  const startErasePreviewLine = selectedEraseRangeStartId ? getLineById(selectedEraseRangeStartId) : null
  const endErasePreviewLine = previewEraseRangeEndId ? getLineById(previewEraseRangeEndId) : null
  const previewEraseLineIds = startErasePreviewLine && endErasePreviewLine
    ? buildRangeLines(startErasePreviewLine, endErasePreviewLine, selectedColor).map((line) => line.id)
    : []
  const startPointRangePreviewPoint = selectedPointRangeStartId ? getPointById(selectedPointRangeStartId) : null
  const endPointRangePreviewPoint = previewPointRangeEndId ? getPointById(previewPointRangeEndId) : null
  const previewPointRangeLineIds = startPointRangePreviewPoint && endPointRangePreviewPoint
    ? buildPointRangeLines(startPointRangePreviewPoint, endPointRangePreviewPoint, selectedColor).map((line) => line.id)
    : []
  const startPointErasePreviewPoint = selectedPointEraseStartId ? getPointById(selectedPointEraseStartId) : null
  const endPointErasePreviewPoint = previewPointEraseEndId ? getPointById(previewPointEraseEndId) : null
  const previewPointEraseLineIds = startPointErasePreviewPoint && endPointErasePreviewPoint
    ? buildPointRangeLines(startPointErasePreviewPoint, endPointErasePreviewPoint, selectedColor).map((line) => line.id)
    : []
  const startRectanglePreviewPoint = selectedRectangleStartId ? getPointById(selectedRectangleStartId) : null
  const endRectanglePreviewPoint = previewRectangleEndId ? getPointById(previewRectangleEndId) : null
  const previewRectangleLineIds = startRectanglePreviewPoint && endRectanglePreviewPoint
    ? buildRectangleLines(startRectanglePreviewPoint, endRectanglePreviewPoint, selectedColor).map((line) => line.id)
    : []
  const startGroundRangePreviewCell = selectedGroundRangeStartId ? getGroundCellById(selectedGroundRangeStartId) : null
  const endGroundRangePreviewCell = previewGroundRangeEndId ? getGroundCellById(previewGroundRangeEndId) : null
  const previewGroundCellIds = startGroundRangePreviewCell && endGroundRangePreviewCell
    ? buildGroundRangeCells(startGroundRangePreviewCell, endGroundRangePreviewCell, selectedGroundTexture).map((cell) => cell.id)
    : []
  const startGroundErasePreviewCell = selectedEraseGroundRangeStartId ? getGroundCellById(selectedEraseGroundRangeStartId) : null
  const endGroundErasePreviewCell = previewEraseGroundRangeEndId ? getGroundCellById(previewEraseGroundRangeEndId) : null
  const previewEraseGroundCellIds = startGroundErasePreviewCell && endGroundErasePreviewCell
    ? buildGroundRangeCells(startGroundErasePreviewCell, endGroundErasePreviewCell, selectedGroundTexture).map((cell) => cell.id)
    : []
  const startGroundRectanglePreviewCell = selectedGroundRectangleStartId ? getGroundCellById(selectedGroundRectangleStartId) : null
  const endGroundRectanglePreviewCell = previewGroundRectangleEndId ? getGroundCellById(previewGroundRectangleEndId) : null
  const previewRectangleGroundCellIds = startGroundRectanglePreviewCell && endGroundRectanglePreviewCell
    ? buildGroundRectangleCells(startGroundRectanglePreviewCell, endGroundRectanglePreviewCell, selectedGroundTexture).map((cell) => cell.id)
    : []
  const elementPickerCategories = elementCategories.map((category) => {
    const categoryLabel = t(`pages.mapEdit.elementCategories.${category}`)

    return {
      key: category,
      label: t('pages.mapEdit.elementCategoryLabel', { category: categoryLabel }),
      selectedVariant: selectedElementVariantByCategory[category],
      options: elementAssetOptions.filter((option) => option.category === category).map((option) => ({
        ...option,
        label: t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant }),
      })),
    }
  })

  return {
    activeLayer,
    colorOptions,
    groundTextureOptions,
    elementPickerCategories,
    drawModeOptions,
    error,
    elements: buildElements(form.grid.elements),
    form,
    handleChange,
    handleClearLinePreview,
    handlePreviewLine,
    handlePreviewPoint,
    handleRemoveLine,
    handleRemovePoint,
    handleRemoveGroundCell,
    handleRemoveElement,
    handleRemoveLabel,
    handleRenameLabel,
    handleSelectPoint,
    handleSelectDrawMode,
    handleSelectLayer,
    handleSelectColor: setSelectedColor,
    handleSelectGroundTexture: setSelectedGroundTexture,
    handleSelectElementAsset,
    handleSubmit,
    handleToggleLine,
    handleToggleGroundCell,
    handleToggleElement,
    handleToggleLabel,
    handlePreviewGroundCell,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    groundCells: buildGroundCells(form.grid.ground),
    labels: buildLabels(form.grid.labels),
    layerOptions,
    lineSegments: buildLineSegments(form.grid.lines),
    loading,
    pointSegments: buildPointSegments(),
    previewEraseLineIds: [...previewEraseLineIds, ...previewPointEraseLineIds],
    previewEraseGroundCellIds,
    previewGroundCellIds,
    previewLineIds: [...previewLineIds, ...previewPointRangeLineIds],
    previewRectangleLineIds,
    previewRectangleGroundCellIds,
    selectedColor,
    selectedGroundTexture,
    selectedElementCategory,
    selectedElementVariant: selectedElementVariantByCategory[selectedElementCategory],
    selectedDrawMode,
    selectedEraseGroundRangeStartId,
    selectedGroundRangeStartId,
    selectedGroundRectangleStartId,
    selectedEraseRangeStartId,
    selectedPointEraseStartId,
    selectedRectangleStartId,
    selectedPointRangeStartId,
    selectedRangeStartId,
    saving,
  }
}
