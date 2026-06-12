import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createMap, deleteMap, listMaps } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Map } from '@appTypes/map'
import type { EditReturnState } from '@pages/useEditReturnNavigation'
import type { MapListCardViewModel, MapsListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeSearchValue = (value: string): string => {
  return value.trim().toLocaleLowerCase()
}

const mapListReturnState: EditReturnState = {
  mainTab: 'maps',
  returnTo: '/',
}

export const useMapsListPage = (): MapsListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [mapToDelete, setMapToDelete] = useState<Map | null>(null)
  const [listSearch, setListSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMaps = async () => {
      try {
        const nextMaps = await listMaps()
        if (!cancelled) {
          setMaps(nextMaps)
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

    void loadMaps()

    return () => {
      cancelled = true
    }
  }, [t])

  const openMap = (mapId: string) => {
    navigate(`/maps/${mapId}/edit`, { state: mapListReturnState })
  }

  const handleCreateMap = async () => {
    setCreating(true)
    setError('')
    try {
      const map = await createMap()
      navigate(`/maps/${map.id}/edit`, { state: mapListReturnState })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    setMapToDelete(null)
  }

  const handleConfirmDeleteMap = async () => {
    if (!mapToDelete) {
      return
    }

    setDeletingId(mapToDelete.id)
    setError('')

    try {
      await deleteMap(mapToDelete.id)
      setMaps((current) => current.filter((item) => item.id !== mapToDelete.id))
      setMapToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const normalizedListSearch = normalizeSearchValue(listSearch)
  const filteredMaps = normalizedListSearch
    ? maps.filter((map) => normalizeSearchValue(map.name.trim() || t('pages.mapList.unnamedMap')).includes(normalizedListSearch))
    : maps

  const cards: MapListCardViewModel[] = filteredMaps.map((map) => ({
    id: map.id,
    deleting: deletingId === map.id,
    description: buildTextPreview(map.description),
    label: map.name.trim() || t('pages.mapList.unnamedMap'),
    onDeleteClick: (mouseEvent) => {
      mouseEvent.stopPropagation()
      setMapToDelete(map)
    },
    onKeyDown: (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault()
        openMap(map.id)
      }
    },
    onOpen: () => {
      openMap(map.id)
    },
  }))

  return {
    cards,
    creating,
    deleteDialogMapName: mapToDelete?.name.trim() || t('pages.mapList.unnamedMap'),
    deletingId,
    error,
    handleChangeListSearch: setListSearch,
    handleCloseDeleteDialog,
    handleConfirmDeleteMap,
    handleCreateMap,
    listSearch,
    loading,
    mapToDelete,
    showEmptySearchState: !loading && maps.length > 0 && cards.length === 0,
    showEmptyState: !loading && maps.length === 0,
    showMapGrid: !loading && cards.length > 0,
  }
}
