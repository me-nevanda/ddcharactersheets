import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMap } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Map as CharacterMap, MapGridElement, MapGridLabel, MapGridLine } from '@appTypes/map'
import { getElementAssetSrc, getMapGroundTextureSrc } from '@pages/MapEditPage/mapEditPageHooks'
import type { MapPrintPageState, PrintMapElement, PrintMapGroundCell, PrintMapLabel, PrintMapLine } from './types'

const mapGridWidth = 34
const mapGridHeight = 22

const buildGroundCells = (map: CharacterMap | null): PrintMapGroundCell[] => {
  const activeGround = new Map((map?.grid.ground ?? []).map((cell) => [cell.id, cell]))

  return Array.from({ length: mapGridWidth * mapGridHeight }, (_, index) => {
    const x = index % mapGridWidth
    const y = Math.floor(index / mapGridWidth)
    const cell = activeGround.get(`${x}:${y}`)

    return {
      id: `${x}:${y}`,
      textureSrc: cell ? getMapGroundTextureSrc(cell.texture) : '',
    }
  })
}

const buildLines = (lines: MapGridLine[]): PrintMapLine[] => {
  return lines.map((line) => {
    const orientation = line.fromY === line.toY ? 'horizontal' : 'vertical'
    const x = Math.min(line.fromX, line.toX)
    const y = Math.min(line.fromY, line.toY)
    const width = orientation === 'horizontal' ? Math.abs(line.toX - line.fromX) : 0
    const height = orientation === 'vertical' ? Math.abs(line.toY - line.fromY) : 0

    return {
      id: line.id,
      color: line.color,
      orientation,
      x,
      y,
      width,
      height,
    }
  })
}

const buildElements = (elements: MapGridElement[]): PrintMapElement[] => {
  return elements.map((element) => ({
    id: element.id,
    imageSrc: getElementAssetSrc(element.category, element.variant),
    x: element.x,
    y: element.y,
  }))
}

const buildLabels = (labels: MapGridLabel[]): PrintMapLabel[] => {
  return labels
    .filter((label) => label.name.trim().length > 0)
    .sort((first, second) => first.y - second.y || first.x - second.x || first.id.localeCompare(second.id))
    .map((label, index) => ({
      id: label.id,
      name: label.name.trim(),
      number: index + 1,
      x: label.x,
      y: label.y,
    }))
}

export const useMapPrintPage = (): MapPrintPageState => {
  const { t } = useI18n()
  const { mapId = '' } = useParams()
  const [map, setMap] = useState<CharacterMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMap = async () => {
      try {
        const nextMap = await getMap(mapId)
        if (!cancelled) {
          setMap(nextMap)
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

  const title = t('pages.mapPrint.title')
  const mapName = map?.name.trim() || t('pages.mapList.unnamedMap')

  useEffect(() => {
    document.title = `${title} - ${mapName}`
  }, [mapName, title])

  return useMemo<MapPrintPageState>(() => ({
    description: map?.description.trim() ?? '',
    elements: buildElements(map?.grid.elements ?? []),
    error,
    groundCells: buildGroundCells(map),
    labels: buildLabels(map?.grid.labels ?? []),
    lines: buildLines(map?.grid.lines ?? []),
    loading,
    map,
    mapName,
    title,
  }), [error, loading, map, mapName, title])
}
