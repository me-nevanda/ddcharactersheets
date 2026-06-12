import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMap, saveMap } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { MapData, MapGridLine } from '@appTypes/map'
import type { MapDrawMode, MapDrawModeOption, MapEditPageState, MapLineOrientation, MapLineViewModel, MapPaletteColor, MapPaletteColorOption } from './types'

const mapGridWidth = 34
const mapGridHeight = 22
const gridCells = Array.from({ length: mapGridWidth * mapGridHeight }, (_, index) => index)

const colorOptions: MapPaletteColorOption[] = [
  { key: 'black', labelKey: 'pages.mapEdit.colors.black' },
  { key: 'red', labelKey: 'pages.mapEdit.colors.red' },
  { key: 'green', labelKey: 'pages.mapEdit.colors.green' },
  { key: 'blue', labelKey: 'pages.mapEdit.colors.blue' },
  { key: 'white', labelKey: 'pages.mapEdit.colors.white' },
  { key: 'gray', labelKey: 'pages.mapEdit.colors.gray' },
  { key: 'yellow', labelKey: 'pages.mapEdit.colors.yellow' },
]

const drawModeOptions: MapDrawModeOption[] = [
  { key: 'single', labelKey: 'pages.mapEdit.drawModes.single' },
  { key: 'range', labelKey: 'pages.mapEdit.drawModes.range' },
  { key: 'rectangle', labelKey: 'pages.mapEdit.drawModes.rectangle' },
]

const createLineId = (fromX: number, fromY: number, toX: number, toY: number): string => {
  return `${fromX}:${fromY}-${toX}:${toY}`
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

const buildRectangleLines = (startLine: MapLineViewModel, endLine: MapLineViewModel, color: MapPaletteColor): MapGridLine[] => {
  const fromX = Math.min(startLine.x, endLine.x)
  const toX = Math.max(startLine.x, endLine.x)
  const fromY = Math.min(startLine.y, endLine.y)
  const toY = Math.max(startLine.y, endLine.y)

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

const replaceLines = (currentLines: MapGridLine[], nextLines: MapGridLine[]): MapGridLine[] => {
  const nextLineIds = new Set(nextLines.map((line) => line.id))
  return [...currentLines.filter((line) => !nextLineIds.has(line.id)), ...nextLines]
}

const removeLines = (currentLines: MapGridLine[], linesToRemove: MapGridLine[]): MapGridLine[] => {
  const lineIdsToRemove = new Set(linesToRemove.map((line) => line.id))
  return currentLines.filter((line) => !lineIdsToRemove.has(line.id))
}

const emptyMapForm: MapData = {
  name: '',
  description: '',
  grid: {
    width: mapGridWidth,
    height: mapGridHeight,
    lines: [],
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
  const [selectedColor, setSelectedColor] = useState<MapPaletteColor>('black')
  const [selectedDrawMode, setSelectedDrawMode] = useState<MapDrawMode>('single')
  const [selectedRangeStartId, setSelectedRangeStartId] = useState('')
  const [previewRangeEndId, setPreviewRangeEndId] = useState('')
  const [selectedEraseRangeStartId, setSelectedEraseRangeStartId] = useState('')
  const [previewEraseRangeEndId, setPreviewEraseRangeEndId] = useState('')

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
      if (!selectedRangeStartId) {
        setSelectedRangeStartId(lineId)
        setSelectedEraseRangeStartId('')
        setPreviewEraseRangeEndId('')
        return
      }

      const startLine = getLineById(selectedRangeStartId)

      if (!startLine) {
        setSelectedRangeStartId(lineId)
        return
      }

      if (selectedDrawMode === 'range' && !canDrawRange(startLine, lineSegment)) {
        setSelectedRangeStartId(lineId)
        return
      }

      const nextRangeLines = selectedDrawMode === 'rectangle'
        ? buildRectangleLines(startLine, lineSegment, selectedColor)
        : buildRangeLines(startLine, lineSegment, selectedColor)

      if (nextRangeLines.length === 0) {
        setSelectedRangeStartId(lineId)
        return
      }

      setForm((current) => ({
        ...current,
        grid: {
          ...current.grid,
          lines: replaceLines(current.grid.lines, nextRangeLines),
        },
      }))
      setSelectedRangeStartId('')
      setPreviewRangeEndId('')
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
  }

  const handlePreviewLine = (lineId: string) => {
    if ((selectedDrawMode !== 'range' && selectedDrawMode !== 'rectangle') || !selectedRangeStartId) {
      if ((selectedDrawMode === 'range' || selectedDrawMode === 'rectangle') && selectedEraseRangeStartId) {
        setPreviewEraseRangeEndId(lineId)
      }
      return
    }

    setPreviewRangeEndId(lineId)
  }

  const handleClearLinePreview = () => {
    setPreviewRangeEndId('')
    setPreviewEraseRangeEndId('')
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
    ? (selectedDrawMode === 'rectangle' ? buildRectangleLines(startPreviewLine, endPreviewLine, selectedColor) : buildRangeLines(startPreviewLine, endPreviewLine, selectedColor)).map((line) => line.id)
    : []
  const startErasePreviewLine = selectedEraseRangeStartId ? getLineById(selectedEraseRangeStartId) : null
  const endErasePreviewLine = previewEraseRangeEndId ? getLineById(previewEraseRangeEndId) : null
  const previewEraseLineIds = startErasePreviewLine && endErasePreviewLine
    ? buildRangeLines(startErasePreviewLine, endErasePreviewLine, selectedColor).map((line) => line.id)
    : []

  return {
    colorOptions,
    drawModeOptions,
    error,
    form,
    gridCells,
    handleChange,
    handleClearLinePreview,
    handlePreviewLine,
    handleRemoveLine,
    handleSelectDrawMode,
    handleSelectColor: setSelectedColor,
    handleSubmit,
    handleToggleLine,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    lineSegments: buildLineSegments(form.grid.lines),
    loading,
    previewEraseLineIds,
    previewLineIds,
    selectedColor,
    selectedDrawMode,
    selectedEraseRangeStartId,
    selectedRangeStartId,
    saving,
  }
}
