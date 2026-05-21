import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createPlace, listPlaces } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Place } from '@appTypes/place'
import type { PlaceListCardViewModel, PlaceListPageState } from './types'

const buildDescriptionPreview = (value: string): string => {
  if (typeof document === 'undefined') {
    return value.replace(/\s+/g, ' ').trim()
  }

  const template = document.createElement('template')
  template.innerHTML = value
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export const usePlaceListPage = (): PlaceListPageState => {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadPlaces = async () => {
      try {
        const nextPlaces = await listPlaces()
        if (!cancelled) {
          setPlaces(nextPlaces)
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

    void loadPlaces()

    return () => {
      cancelled = true
    }
  }, [t])

  const openPlace = (placeId: string) => {
    navigate(`/places/${placeId}/edit`)
  }

  const handleCreatePlace = async () => {
    setCreating(true)
    setError('')
    try {
      const place = await createPlace()
      navigate(`/places/${place.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const cards: PlaceListCardViewModel[] = places.map((place) => ({
    id: place.id,
    label: place.name.trim() || t('pages.placeList.unnamedPlace'),
    descriptionPreview: buildDescriptionPreview(place.description),
    updatedAtLabel: dateFormatter.format(new Date(place.updatedAt)),
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openPlace(place.id)
      }
    },
    onOpen: () => {
      openPlace(place.id)
    },
  }))

  return {
    cards,
    creating,
    error,
    handleCreatePlace,
    loading,
    showPlaceGrid: !loading && cards.length > 0,
    showEmptyState: !loading && cards.length === 0,
  }
}
