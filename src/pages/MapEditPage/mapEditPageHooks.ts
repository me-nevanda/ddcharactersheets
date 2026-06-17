import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent, type PointerEvent, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMap, saveMap } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { MapData, MapElementCategory, MapElementVariant, MapGridData, MapGroundTexture } from '@appTypes/map'
import { colorOptions, drawModeOptions, groundTextureOptions, layerOptions } from './mapEditPageOptions'
import { useMapElementPickerCategories } from './mapElementPickerHooks'
import { areMapGridsEqual, buildElements, buildGroundCells, buildGroundRangeCells, buildGroundRectangleCells, buildLabels, buildLineSegments, buildPointRangeLines, buildPointSegments, buildRangeLines, buildRectangleLines, canDrawGroundRange, canDrawRange, createElement, createGroundCell, createGroundCellId, createLabel, createLine, createPointId, emptyMapForm, getElementById, getGroundCellById, getLabelById, getLineById, getMouseGridPosition, getPointById, getPointerGridPosition, loadMapUndoStack, removeGroundCells, removeLines, replaceElements, replaceGroundCells, replaceLabels, replaceLines, saveMapUndoStack, undoStackLimit, type MapLineDragAxis } from './mapEditPageLogic'
import type { MapDrawMode, MapEditPageState, MapLayer, MapLineViewModel, MapPaletteColor } from './types'

export { getElementAssetSrc, getMapGroundTextureSrc } from './mapEditPageOptions'

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
    stones: '1',
    monsters: '1',
    misc: '1',
  })
  const [selectedDrawMode, setSelectedDrawMode] = useState<MapDrawMode>('single')
  const [selectedRangeStartId, setSelectedRangeStartId] = useState('')
  const [previewSingleLineId, setPreviewSingleLineId] = useState('')
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
  const [previewGroundSingleCellId, setPreviewGroundSingleCellId] = useState('')
  const [previewGroundRangeEndId, setPreviewGroundRangeEndId] = useState('')
  const [selectedEraseGroundRangeStartId, setSelectedEraseGroundRangeStartId] = useState('')
  const [previewEraseGroundRangeEndId, setPreviewEraseGroundRangeEndId] = useState('')
  const [selectedGroundRectangleStartId, setSelectedGroundRectangleStartId] = useState('')
  const [previewGroundRectangleEndId, setPreviewGroundRectangleEndId] = useState('')
  const mapDragActionRef = useRef<'paint' | 'erase' | null>(null)
  const lastPaintedCellIdRef = useRef('')
  const lastPaintedLineIdRef = useRef('')
  const lineDragAxisRef = useRef<MapLineDragAxis | null>(null)
  const suppressNextLineClickRef = useRef(false)
  const undoStackRef = useRef<MapGridData[]>([])
  const undoMapChangeRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    let cancelled = false
    undoStackRef.current = loadMapUndoStack(mapId)

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

  const pushUndoGridSnapshot = (grid: MapGridData) => {
    const previousGrid = undoStackRef.current[undoStackRef.current.length - 1]

    if (previousGrid && areMapGridsEqual(previousGrid, grid)) {
      return
    }

    undoStackRef.current = [...undoStackRef.current, grid].slice(-undoStackLimit)
    saveMapUndoStack(mapId, undoStackRef.current)
  }

  const updateGrid = (getNextGrid: (grid: MapGridData) => MapGridData) => {
    setForm((current) => {
      const nextGrid = getNextGrid(current.grid)

      if (areMapGridsEqual(current.grid, nextGrid)) {
        return current
      }

      pushUndoGridSnapshot(current.grid)

      return {
        ...current,
        grid: nextGrid,
      }
    })
  }

  const clearMapInteractionState = () => {
    setSelectedRangeStartId('')
    setPreviewSingleLineId('')
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
    setPreviewGroundSingleCellId('')
    setPreviewGroundRangeEndId('')
    setSelectedEraseGroundRangeStartId('')
    setPreviewEraseGroundRangeEndId('')
    setSelectedGroundRectangleStartId('')
    setPreviewGroundRectangleEndId('')
    mapDragActionRef.current = null
    lastPaintedCellIdRef.current = ''
    lastPaintedLineIdRef.current = ''
    lineDragAxisRef.current = null
    suppressNextLineClickRef.current = false
  }

  const handleUndoMapChange = () => {
    const previousGrid = undoStackRef.current[undoStackRef.current.length - 1]

    if (!previousGrid) {
      return
    }

    clearMapInteractionState()
    undoStackRef.current = undoStackRef.current.slice(0, -1)
    saveMapUndoStack(mapId, undoStackRef.current)
    setForm((current) => ({
      ...current,
      grid: previousGrid,
    }))
  }

  undoMapChangeRef.current = handleUndoMapChange

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTextEditingTarget = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable

      if (isTextEditingTarget || !event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || event.key.toLowerCase() !== 'z') {
        return
      }

      event.preventDefault()
      undoMapChangeRef.current()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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

    updateGrid((currentGrid) => {
      const nextLine = createLine(lineSegment.orientation, lineSegment.x, lineSegment.y, selectedColor)
      const nextLines = replaceLines(currentGrid.lines, [nextLine])

      return {
        ...currentGrid,
        lines: nextLines,
      }
    })
  }

  const paintLineSegment = (lineId: string) => {
    const lineSegment = getLineById(lineId)

    if (!lineSegment) {
      return
    }

    updateGrid((currentGrid) => {
      const existingLine = currentGrid.lines.find((line) => line.id === lineId)

      if (existingLine?.color === selectedColor) {
        return currentGrid
      }

      const nextLine = createLine(lineSegment.orientation, lineSegment.x, lineSegment.y, selectedColor)
      const nextLines = replaceLines(currentGrid.lines, [nextLine])

      return {
        ...currentGrid,
        lines: nextLines,
      }
    })
  }

  const eraseLineSegment = (lineId: string) => {
    updateGrid((currentGrid) => {
      if (!currentGrid.lines.some((line) => line.id === lineId)) {
        return currentGrid
      }

      return {
        ...currentGrid,
        lines: currentGrid.lines.filter((line) => line.id !== lineId),
      }
    })
  }

  const canApplyLineDragAction = (lineSegment: MapLineViewModel): boolean => {
    const axis = lineSegment.orientation === 'horizontal' ? lineSegment.y : lineSegment.x

    if (!lineDragAxisRef.current) {
      lineDragAxisRef.current = {
        orientation: lineSegment.orientation,
        axis,
      }
      return true
    }

    return lineDragAxisRef.current.orientation === lineSegment.orientation && lineDragAxisRef.current.axis === axis
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
      updateGrid((currentGrid) => ({
        ...currentGrid,
        lines: removeLines(currentGrid.lines, nextRangeLines),
      }))
      setSelectedEraseRangeStartId('')
      setPreviewEraseRangeEndId('')
      return
    }

    setSelectedRangeStartId('')
    setPreviewRangeEndId('')
    updateGrid((currentGrid) => ({
      ...currentGrid,
      lines: currentGrid.lines.filter((line) => line.id !== lineId),
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
    setPreviewGroundSingleCellId('')
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
    setPreviewGroundSingleCellId('')
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
    if (selectedDrawMode === 'single') {
      setPreviewSingleLineId((current) => current === lineId ? current : lineId)
      return
    }

    if (selectedDrawMode !== 'range' || !selectedRangeStartId) {
      if (selectedDrawMode === 'range' && selectedEraseRangeStartId) {
        setPreviewEraseRangeEndId((current) => current === lineId ? current : lineId)
      }
      return
    }

    setPreviewRangeEndId((current) => current === lineId ? current : lineId)
  }

  const handleClearLinePreview = () => {
    setPreviewSingleLineId((current) => current ? '' : current)
    setPreviewRangeEndId((current) => current ? '' : current)
    setPreviewEraseRangeEndId((current) => current ? '' : current)
    setPreviewRectangleEndId((current) => current ? '' : current)
    setPreviewPointRangeEndId((current) => current ? '' : current)
    setPreviewPointEraseEndId((current) => current ? '' : current)
    setPreviewGroundSingleCellId((current) => current ? '' : current)
    setPreviewGroundRangeEndId((current) => current ? '' : current)
    setPreviewEraseGroundRangeEndId((current) => current ? '' : current)
    setPreviewGroundRectangleEndId((current) => current ? '' : current)
  }

  const handlePreviewMapPointer = (event: PointerEvent<HTMLElement>) => {
    const position = getPointerGridPosition(event)
    const cellId = createGroundCellId(position.cellX, position.cellY)

    if (mapDragActionRef.current) {
      const expectedButton = mapDragActionRef.current === 'paint' ? 1 : 2

      if ((event.buttons & expectedButton) !== expectedButton) {
        handleMapPointerUp()
      } else if (activeLayer === 'lines' && selectedDrawMode === 'single') {
        applyLineDragAction(position.lineId)
      } else {
        applyMapDragAction(cellId)
      }
    }

    if (activeLayer === 'lines') {
      if (selectedDrawMode === 'single') {
        handlePreviewLine(position.lineId)
        return
      }

      if (selectedDrawMode !== 'range' && selectedDrawMode !== 'rectangle') {
        return
      }

      const pointId = createPointId(position.pointX, position.pointY)
      handlePreviewPoint(pointId)
      return
    }

    if (activeLayer === 'ground') {
      handlePreviewGroundCell(cellId)
    }
  }

  const handleMapClick = (event: MouseEvent<HTMLElement>) => {
    if (activeLayer !== 'lines' || selectedDrawMode !== 'single') {
      return
    }

    if (suppressNextLineClickRef.current) {
      suppressNextLineClickRef.current = false
      return
    }

    handleToggleLine(getMouseGridPosition(event).lineId)
  }

  const handleMapContextMenu = (event: MouseEvent<HTMLElement>) => {
    if ((activeLayer === 'ground' && selectedDrawMode === 'single') || activeLayer === 'elements') {
      event.preventDefault()
      return
    }

    if (activeLayer !== 'lines' || selectedDrawMode !== 'single') {
      return
    }

    event.preventDefault()
    handleRemoveLine(getMouseGridPosition(event).lineId, event)
  }

  const paintGroundCell = (cellId: string) => {
    const groundCell = getGroundCellById(cellId)

    if (!groundCell) {
      return
    }

    updateGrid((currentGrid) => {
      const existingCell = currentGrid.ground.find((cell) => cell.id === cellId)

      if (existingCell?.texture === selectedGroundTexture) {
        return currentGrid
      }

      return {
        ...currentGrid,
        ground: replaceGroundCells(currentGrid.ground, [createGroundCell(groundCell.x, groundCell.y, selectedGroundTexture)]),
      }
    })
  }

  const paintElementCell = (cellId: string) => {
    const element = getElementById(cellId)

    if (!element) {
      return
    }

    const selectedElementVariant = selectedElementVariantByCategory[selectedElementCategory]

    updateGrid((currentGrid) => {
      const existingElement = currentGrid.elements.find((currentElement) => currentElement.id === cellId)

      if (existingElement?.category === selectedElementCategory && existingElement.variant === selectedElementVariant) {
        return currentGrid
      }

      return {
        ...currentGrid,
        elements: replaceElements(currentGrid.elements, [createElement(element.x, element.y, selectedElementCategory, selectedElementVariant)]),
      }
    })
  }

  const eraseGroundCell = (cellId: string) => {
    updateGrid((currentGrid) => {
      if (!currentGrid.ground.some((cell) => cell.id === cellId)) {
        return currentGrid
      }

      return {
        ...currentGrid,
        ground: currentGrid.ground.filter((cell) => cell.id !== cellId),
      }
    })
  }

  const eraseElementCell = (cellId: string) => {
    updateGrid((currentGrid) => {
      if (!currentGrid.elements.some((element) => element.id === cellId)) {
        return currentGrid
      }

      return {
        ...currentGrid,
        elements: currentGrid.elements.filter((element) => element.id !== cellId),
      }
    })
  }

  const applyMapDragAction = (cellId: string) => {
    if (lastPaintedCellIdRef.current === cellId) {
      return
    }

    if (activeLayer === 'ground' && selectedDrawMode === 'single') {
      lastPaintedCellIdRef.current = cellId
      if (mapDragActionRef.current === 'erase') {
        eraseGroundCell(cellId)
        return
      }

      paintGroundCell(cellId)
      return
    }

    if (activeLayer === 'elements') {
      lastPaintedCellIdRef.current = cellId
      if (mapDragActionRef.current === 'erase') {
        eraseElementCell(cellId)
        return
      }

      paintElementCell(cellId)
    }
  }

  const applyLineDragAction = (lineId: string) => {
    if (lastPaintedLineIdRef.current === lineId) {
      return
    }

    const lineSegment = getLineById(lineId)

    if (!lineSegment || !canApplyLineDragAction(lineSegment)) {
      return
    }

    lastPaintedLineIdRef.current = lineId

    if (mapDragActionRef.current === 'erase') {
      eraseLineSegment(lineId)
      return
    }

    paintLineSegment(lineId)
  }

  const handleMapPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.button !== 0 && event.button !== 2) || !((activeLayer === 'lines' && selectedDrawMode === 'single') || (activeLayer === 'ground' && selectedDrawMode === 'single') || activeLayer === 'elements')) {
      return
    }

    event.preventDefault()
    const position = getPointerGridPosition(event)
    const cellId = createGroundCellId(position.cellX, position.cellY)
    mapDragActionRef.current = event.button === 2 ? 'erase' : 'paint'
    lastPaintedCellIdRef.current = ''
    lastPaintedLineIdRef.current = ''
    lineDragAxisRef.current = null
    event.currentTarget.setPointerCapture(event.pointerId)

    if (activeLayer === 'lines') {
      suppressNextLineClickRef.current = event.button === 0
      applyLineDragAction(position.lineId)
      return
    }

    applyMapDragAction(cellId)
  }

  const handleMapPointerUp = () => {
    mapDragActionRef.current = null
    lastPaintedCellIdRef.current = ''
    lastPaintedLineIdRef.current = ''
    lineDragAxisRef.current = null
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

      updateGrid((currentGrid) => ({
        ...currentGrid,
        lines: replaceLines(currentGrid.lines, nextRangeLines),
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

    updateGrid((currentGrid) => ({
      ...currentGrid,
      lines: replaceLines(currentGrid.lines, nextRectangleLines),
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

    updateGrid((currentGrid) => ({
      ...currentGrid,
      lines: removeLines(currentGrid.lines, nextRangeLines),
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
      paintGroundCell(cellId)
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
      updateGrid((currentGrid) => ({
        ...currentGrid,
        ground: replaceGroundCells(currentGrid.ground, nextGroundCells),
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
    updateGrid((currentGrid) => ({
      ...currentGrid,
      ground: replaceGroundCells(currentGrid.ground, nextGroundCells),
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
      updateGrid((currentGrid) => ({
        ...currentGrid,
        ground: removeGroundCells(currentGrid.ground, nextGroundCells),
      }))
      setSelectedEraseGroundRangeStartId('')
      setPreviewEraseGroundRangeEndId('')
      return
    }

    setSelectedGroundRangeStartId('')
    setPreviewGroundRangeEndId('')
    updateGrid((currentGrid) => ({
      ...currentGrid,
      ground: currentGrid.ground.filter((cell) => cell.id !== cellId),
    }))
  }

  const handlePreviewPoint = (pointId: string) => {
    if (selectedDrawMode === 'range' && selectedPointEraseStartId) {
      setPreviewPointEraseEndId((current) => current === pointId ? current : pointId)
      return
    }

    if (selectedDrawMode === 'range' && selectedPointRangeStartId) {
      setPreviewPointRangeEndId((current) => current === pointId ? current : pointId)
      return
    }

    if (selectedDrawMode === 'rectangle' && selectedRectangleStartId) {
      setPreviewRectangleEndId((current) => current === pointId ? current : pointId)
    }
  }

  const handlePreviewGroundCell = (cellId: string) => {
    if (selectedDrawMode === 'single') {
      setPreviewGroundSingleCellId((current) => current === cellId ? current : cellId)
      return
    }

    if (selectedDrawMode === 'range' && selectedEraseGroundRangeStartId) {
      setPreviewEraseGroundRangeEndId((current) => current === cellId ? current : cellId)
      return
    }

    if (selectedDrawMode === 'range' && selectedGroundRangeStartId) {
      setPreviewGroundRangeEndId((current) => current === cellId ? current : cellId)
      return
    }

    if (selectedDrawMode === 'rectangle' && selectedGroundRectangleStartId) {
      setPreviewGroundRectangleEndId((current) => current === cellId ? current : cellId)
    }
  }

  const handleToggleElement = (elementId: string) => {
    const element = getElementById(elementId)

    if (!element) {
      return
    }

    paintElementCell(elementId)
  }

  const handleRemoveElement: MapEditPageState['handleRemoveElement'] = (elementId, event) => {
    event?.preventDefault()
    updateGrid((currentGrid) => ({
      ...currentGrid,
      elements: currentGrid.elements.filter((element) => element.id !== elementId),
    }))
  }

  const handleToggleLabel = (labelId: string) => {
    const label = getLabelById(labelId)

    if (!label) {
      return
    }

    updateGrid((currentGrid) => {
      const existingLabel = currentGrid.labels.find((currentLabel) => currentLabel.id === labelId)

      return {
        ...currentGrid,
        labels: replaceLabels(currentGrid.labels, [createLabel(label.x, label.y, existingLabel?.name)]),
      }
    })
  }

  const handleRemoveLabel: MapEditPageState['handleRemoveLabel'] = (labelId, event) => {
    event?.preventDefault()
    updateGrid((currentGrid) => ({
      ...currentGrid,
      labels: currentGrid.labels.filter((label) => label.id !== labelId),
    }))
  }

  const handleRenameLabel: MapEditPageState['handleRenameLabel'] = (labelId, name) => {
    updateGrid((currentGrid) => ({
      ...currentGrid,
      labels: currentGrid.labels.map((label) => (
        label.id === labelId
          ? { ...label, name: name.trim() }
          : label
      )),
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

  const elements = useMemo(() => buildElements(form.grid.elements), [form.grid.elements])
  const groundCells = useMemo(() => buildGroundCells(form.grid.ground), [form.grid.ground])
  const labels = useMemo(() => buildLabels(form.grid.labels), [form.grid.labels])
  const lineSegments = useMemo(() => buildLineSegments(form.grid.lines), [form.grid.lines])
  const pointSegments = useMemo(() => buildPointSegments(), [])
  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])

  const previewLineIds = useMemo(() => {
    if (selectedDrawMode === 'single') {
      return previewSingleLineId ? [previewSingleLineId] : []
    }

    const startPreviewLine = selectedRangeStartId ? getLineById(selectedRangeStartId) : null
    const endPreviewLine = previewRangeEndId ? getLineById(previewRangeEndId) : null

    return startPreviewLine && endPreviewLine
      ? buildRangeLines(startPreviewLine, endPreviewLine, selectedColor).map((line) => line.id)
      : []
  }, [previewRangeEndId, previewSingleLineId, selectedColor, selectedDrawMode, selectedRangeStartId])
  const previewEraseLineIds = useMemo(() => {
    const startErasePreviewLine = selectedEraseRangeStartId ? getLineById(selectedEraseRangeStartId) : null
    const endErasePreviewLine = previewEraseRangeEndId ? getLineById(previewEraseRangeEndId) : null

    return startErasePreviewLine && endErasePreviewLine
      ? buildRangeLines(startErasePreviewLine, endErasePreviewLine, selectedColor).map((line) => line.id)
      : []
  }, [previewEraseRangeEndId, selectedColor, selectedEraseRangeStartId])
  const previewPointRangeLineIds = useMemo(() => {
    const startPointRangePreviewPoint = selectedPointRangeStartId ? getPointById(selectedPointRangeStartId) : null
    const endPointRangePreviewPoint = previewPointRangeEndId ? getPointById(previewPointRangeEndId) : null

    return startPointRangePreviewPoint && endPointRangePreviewPoint
      ? buildPointRangeLines(startPointRangePreviewPoint, endPointRangePreviewPoint, selectedColor).map((line) => line.id)
      : []
  }, [previewPointRangeEndId, selectedColor, selectedPointRangeStartId])
  const previewPointEraseLineIds = useMemo(() => {
    const startPointErasePreviewPoint = selectedPointEraseStartId ? getPointById(selectedPointEraseStartId) : null
    const endPointErasePreviewPoint = previewPointEraseEndId ? getPointById(previewPointEraseEndId) : null

    return startPointErasePreviewPoint && endPointErasePreviewPoint
      ? buildPointRangeLines(startPointErasePreviewPoint, endPointErasePreviewPoint, selectedColor).map((line) => line.id)
      : []
  }, [previewPointEraseEndId, selectedColor, selectedPointEraseStartId])
  const previewRectangleLineIds = useMemo(() => {
    const startRectanglePreviewPoint = selectedRectangleStartId ? getPointById(selectedRectangleStartId) : null
    const endRectanglePreviewPoint = previewRectangleEndId ? getPointById(previewRectangleEndId) : null

    return startRectanglePreviewPoint && endRectanglePreviewPoint
      ? buildRectangleLines(startRectanglePreviewPoint, endRectanglePreviewPoint, selectedColor).map((line) => line.id)
      : []
  }, [previewRectangleEndId, selectedColor, selectedRectangleStartId])
  const previewGroundCellIds = useMemo(() => {
    const startGroundRangePreviewCell = selectedGroundRangeStartId ? getGroundCellById(selectedGroundRangeStartId) : null
    const endGroundRangePreviewCell = previewGroundRangeEndId ? getGroundCellById(previewGroundRangeEndId) : null

    return startGroundRangePreviewCell && endGroundRangePreviewCell
      ? buildGroundRangeCells(startGroundRangePreviewCell, endGroundRangePreviewCell, selectedGroundTexture).map((cell) => cell.id)
      : previewGroundSingleCellId
        ? [previewGroundSingleCellId]
        : []
  }, [previewGroundRangeEndId, previewGroundSingleCellId, selectedGroundRangeStartId, selectedGroundTexture])
  const previewEraseGroundCellIds = useMemo(() => {
    const startGroundErasePreviewCell = selectedEraseGroundRangeStartId ? getGroundCellById(selectedEraseGroundRangeStartId) : null
    const endGroundErasePreviewCell = previewEraseGroundRangeEndId ? getGroundCellById(previewEraseGroundRangeEndId) : null

    return startGroundErasePreviewCell && endGroundErasePreviewCell
      ? buildGroundRangeCells(startGroundErasePreviewCell, endGroundErasePreviewCell, selectedGroundTexture).map((cell) => cell.id)
      : []
  }, [previewEraseGroundRangeEndId, selectedEraseGroundRangeStartId, selectedGroundTexture])
  const previewRectangleGroundCellIds = useMemo(() => {
    const startGroundRectanglePreviewCell = selectedGroundRectangleStartId ? getGroundCellById(selectedGroundRectangleStartId) : null
    const endGroundRectanglePreviewCell = previewGroundRectangleEndId ? getGroundCellById(previewGroundRectangleEndId) : null

    return startGroundRectanglePreviewCell && endGroundRectanglePreviewCell
      ? buildGroundRectangleCells(startGroundRectanglePreviewCell, endGroundRectanglePreviewCell, selectedGroundTexture).map((cell) => cell.id)
      : []
  }, [previewGroundRectangleEndId, selectedGroundRectangleStartId, selectedGroundTexture])
  const elementPickerCategories = useMapElementPickerCategories(selectedElementVariantByCategory, t)

  const combinedPreviewEraseLineIds = useMemo(() => [...previewEraseLineIds, ...previewPointEraseLineIds], [previewEraseLineIds, previewPointEraseLineIds])
  const combinedPreviewLineIds = useMemo(() => [...previewLineIds, ...previewPointRangeLineIds], [previewLineIds, previewPointRangeLineIds])

  return {
    activeLayer,
    colorOptions,
    groundTextureOptions,
    elementPickerCategories,
    drawModeOptions,
    error,
    elements,
    form,
    handleChange,
    handleClearLinePreview,
    handleMapClick,
    handleMapContextMenu,
    handleMapPointerDown,
    handleMapPointerUp,
    handlePreviewLine,
    handlePreviewMapPointer,
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
    hasChanges,
    groundCells,
    labels,
    layerOptions,
    lineSegments,
    loading,
    pointSegments,
    previewEraseLineIds: combinedPreviewEraseLineIds,
    previewEraseGroundCellIds,
    previewGroundCellIds,
    previewLineIds: combinedPreviewLineIds,
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

