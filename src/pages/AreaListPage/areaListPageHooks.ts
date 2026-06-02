import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createArea, deleteArea, listAreas } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { EditReturnState } from '@pages/useEditReturnNavigation'
import type { Area } from '@appTypes/area'
import type { AreaListCardViewModel, AreaListPageState } from './types'

const buildDescriptionPreview = (value: string): string => {
  if (typeof document === 'undefined') {
    return value.replace(/\s+/g, ' ').trim()
  }

  const template = document.createElement('template')
  template.innerHTML = value
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
}

const normalizeSearchValue = (value: string): string => {
  return value.trim().toLocaleLowerCase()
}

const areaListReturnState: EditReturnState = {
  mainTab: 'areas',
  returnTo: '/',
}

export const useAreaListPage = (): AreaListPageState => {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null)
  const [listSearch, setListSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadAreas = async () => {
      try {
        const nextAreas = await listAreas()
        if (!cancelled) {
          setAreas(nextAreas)
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

    void loadAreas()

    return () => {
      cancelled = true
    }
  }, [t])

  const openArea = (areaId: string) => {
    navigate(`/areas/${areaId}/edit`, { state: areaListReturnState })
  }

  const handleCreateArea = async () => {
    setCreating(true)
    setError('')
    try {
      const area = await createArea()
      navigate(`/areas/${area.id}/edit`, { state: areaListReturnState })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleOpenDeleteDialog = (area: Area) => {
    setAreaToDelete(area)
  }

  const handleCloseDeleteDialog = () => {
    setAreaToDelete(null)
  }

  const handleConfirmDeleteArea = async () => {
    if (!areaToDelete) {
      return
    }

    setDeletingId(areaToDelete.id)
    setError('')

    try {
      await deleteArea(areaToDelete.id)
      setAreas((current) => current.filter((item) => item.id !== areaToDelete.id))
      setAreaToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const normalizedListSearch = normalizeSearchValue(listSearch)
  const filteredAreas = normalizedListSearch
    ? areas.filter((area) => normalizeSearchValue(area.name.trim() || t('pages.areaList.unnamedArea')).includes(normalizedListSearch))
    : areas

  const cards: AreaListCardViewModel[] = filteredAreas.map((area) => ({
    id: area.id,
    deleting: deletingId === area.id,
    imageUrl: area.imageUrl,
    label: area.name.trim() || t('pages.areaList.unnamedArea'),
    descriptionPreview: buildDescriptionPreview(area.description),
    updatedAtLabel: dateFormatter.format(new Date(area.updatedAt)),
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteDialog(area)
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openArea(area.id)
      }
    },
    onOpen: () => {
      openArea(area.id)
    },
  }))

  return {
    cards,
    areaToDelete,
    creating,
    deleteDialogAreaName: areaToDelete?.name.trim() || t('pages.areaList.unnamedArea'),
    deletingId,
    error,
    handleCloseDeleteDialog,
    handleConfirmDeleteArea,
    handleChangeListSearch: setListSearch,
    handleCreateArea,
    listSearch,
    loading,
    showAreaGrid: !loading && cards.length > 0,
    showEmptySearchState: !loading && areas.length > 0 && cards.length === 0,
    showEmptyState: !loading && areas.length === 0,
  }
}
