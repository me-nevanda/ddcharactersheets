import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getPlace, savePlace } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useMainPageContext } from '@pages/main/mainPageContext'
import type { PlaceData, PlaceItem } from '@appTypes/place'
import type { PlaceEditPageState } from './types'

const emptyPlace: PlaceData = {
  uniqueId: '',
  name: '',
  description: '',
  places: [],
}

const arePlaceItemsEqual = (left: PlaceItem[], right: PlaceItem[]): boolean => {
  if (left.length !== right.length) {
    return false
  }
  return left.every((leftItem, index) => {
    const rightItem = right[index]
    return leftItem.id === rightItem.id && leftItem.name === rightItem.name && leftItem.description === rightItem.description
  })
}

const arePlacesEqual = (left: PlaceData, right: PlaceData): boolean => {
  return left.uniqueId === right.uniqueId && left.name === right.name && left.description === right.description && arePlaceItemsEqual(left.places, right.places)
}

const generatePlaceItemId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `place-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const clonePlaceItems = (items: PlaceItem[]): PlaceItem[] => {
  return items.map((item) => ({ ...item }))
}

export const usePlaceEditPage = (): PlaceEditPageState => {
  const { t } = useI18n()
  const { placeId = '' } = useParams()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const [form, setForm] = useState<PlaceData>(emptyPlace)
  const [savedPlace, setSavedPlace] = useState<PlaceData>(emptyPlace)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [placeItemToRemoveId, setPlaceItemToRemoveId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadPlace = async () => {
      try {
        const place = await getPlace(placeId)
        const nextPlace: PlaceData = {
          uniqueId: place.uniqueId,
          name: place.name,
          description: place.description,
          places: clonePlaceItems(place.places),
        }
        if (!cancelled) {
          setForm(nextPlace)
          setSavedPlace({ ...nextPlace, places: clonePlaceItems(nextPlace.places) })
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

    void loadPlace()

    return () => {
      cancelled = true
    }
  }, [placeId, t])

  const hasChanges = useMemo(() => {
    return !arePlacesEqual(form, savedPlace)
  }, [form, savedPlace])

  const placeItemToRemove = useMemo(() => {
    if (placeItemToRemoveId === null) {
      return null
    }
    return form.places.find((item) => item.id === placeItemToRemoveId) ?? null
  }, [form.places, placeItemToRemoveId])

  const handleNameChange: PlaceEditPageState['handleNameChange'] = (event) => {
    const { value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      name: value,
    }))
  }

  const handleDescriptionChange: PlaceEditPageState['handleDescriptionChange'] = (value) => {
    setForm((currentForm) => ({
      ...currentForm,
      description: value,
    }))
  }

  const handleAddPlaceItem: PlaceEditPageState['handleAddPlaceItem'] = () => {
    setForm((currentForm) => ({
      ...currentForm,
      places: [...currentForm.places, { id: generatePlaceItemId(), name: '', description: '' }],
    }))
  }

  const handleRequestRemovePlaceItem: PlaceEditPageState['handleRequestRemovePlaceItem'] = (id) => {
    setPlaceItemToRemoveId(id)
  }

  const handleCancelRemovePlaceItem: PlaceEditPageState['handleCancelRemovePlaceItem'] = () => {
    setPlaceItemToRemoveId(null)
  }

  const handleConfirmRemovePlaceItem: PlaceEditPageState['handleConfirmRemovePlaceItem'] = () => {
    if (placeItemToRemoveId === null) {
      return
    }
    const idToRemove = placeItemToRemoveId
    setForm((currentForm) => ({
      ...currentForm,
      places: currentForm.places.filter((item) => item.id !== idToRemove),
    }))
    setPlaceItemToRemoveId(null)
  }

  const handlePlaceItemNameChange: PlaceEditPageState['handlePlaceItemNameChange'] = (id, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      places: currentForm.places.map((item) => (item.id === id ? { ...item, name: value } : item)),
    }))
  }

  const handlePlaceItemDescriptionChange: PlaceEditPageState['handlePlaceItemDescriptionChange'] = (id, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      places: currentForm.places.map((item) => (item.id === id ? { ...item, description: value } : item)),
    }))
  }

  const handleSubmit: PlaceEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const place = await savePlace(placeId, form)
      const nextPlace: PlaceData = {
        uniqueId: place.uniqueId,
        name: place.name,
        description: place.description,
        places: clonePlaceItems(place.places),
      }
      setForm(nextPlace)
      setSavedPlace({ ...nextPlace, places: clonePlaceItems(nextPlace.places) })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const handleBackToListClick = () => {
    handleTabChange('places')
    navigate('/')
  }

  return {
    error,
    form,
    handleBackToListClick,
    handleNameChange,
    handleDescriptionChange,
    handleAddPlaceItem,
    handleRequestRemovePlaceItem,
    handleCancelRemovePlaceItem,
    handleConfirmRemovePlaceItem,
    placeItemToRemove,
    handlePlaceItemNameChange,
    handlePlaceItemDescriptionChange,
    handleSubmit,
    hasChanges,
    loading,
    saving,
  }
}
