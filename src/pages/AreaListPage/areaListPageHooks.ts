import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createArea, listAreas } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
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

export const useAreaListPage = (): AreaListPageState => {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
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
    navigate(`/areas/${areaId}/edit`)
  }

  const handleCreateArea = async () => {
    setCreating(true)
    setError('')
    try {
      const area = await createArea()
      navigate(`/areas/${area.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const cards: AreaListCardViewModel[] = areas.map((area) => ({
    id: area.id,
    label: area.name.trim() || t('pages.areaList.unnamedArea'),
    descriptionPreview: buildDescriptionPreview(area.description),
    updatedAtLabel: dateFormatter.format(new Date(area.updatedAt)),
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
    creating,
    error,
    handleCreateArea,
    loading,
    showAreaGrid: !loading && cards.length > 0,
    showEmptyState: !loading && cards.length === 0,
  }
}
