import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getArea, saveArea } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useMainPageContext } from '@pages/main/mainPageContext'
import type { AreaData, PlaceItem } from '@appTypes/area'
import type { AreaEditPageState } from './types'

const emptyArea: AreaData = {
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

const areAreasEqual = (left: AreaData, right: AreaData): boolean => {
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

export const useAreaEditPage = (): AreaEditPageState => {
  const { t } = useI18n()
  const { areaId = '' } = useParams()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const [form, setForm] = useState<AreaData>(emptyArea)
  const [savedArea, setSavedArea] = useState<AreaData>(emptyArea)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [placeItemToRemoveId, setPlaceItemToRemoveId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadArea = async () => {
      try {
        const area = await getArea(areaId)
        const nextArea: AreaData = {
          uniqueId: area.uniqueId,
          name: area.name,
          description: area.description,
          places: clonePlaceItems(area.places),
        }
        if (!cancelled) {
          setForm(nextArea)
          setSavedArea({ ...nextArea, places: clonePlaceItems(nextArea.places) })
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

    void loadArea()

    return () => {
      cancelled = true
    }
  }, [areaId, t])

  const hasChanges = useMemo(() => {
    return !areAreasEqual(form, savedArea)
  }, [form, savedArea])

  const placeItemToRemove = useMemo(() => {
    if (placeItemToRemoveId === null) {
      return null
    }
    return form.places.find((item) => item.id === placeItemToRemoveId) ?? null
  }, [form.places, placeItemToRemoveId])

  const handleNameChange: AreaEditPageState['handleNameChange'] = (event) => {
    const { value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      name: value,
    }))
  }

  const handleDescriptionChange: AreaEditPageState['handleDescriptionChange'] = (value) => {
    setForm((currentForm) => ({
      ...currentForm,
      description: value,
    }))
  }

  const handleAddPlaceItem: AreaEditPageState['handleAddPlaceItem'] = () => {
    setForm((currentForm) => ({
      ...currentForm,
      places: [...currentForm.places, { id: generatePlaceItemId(), name: '', description: '' }],
    }))
  }

  const handleRequestRemovePlaceItem: AreaEditPageState['handleRequestRemovePlaceItem'] = (id) => {
    setPlaceItemToRemoveId(id)
  }

  const handleCancelRemovePlaceItem: AreaEditPageState['handleCancelRemovePlaceItem'] = () => {
    setPlaceItemToRemoveId(null)
  }

  const handleConfirmRemovePlaceItem: AreaEditPageState['handleConfirmRemovePlaceItem'] = () => {
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

  const handlePlaceItemNameChange: AreaEditPageState['handlePlaceItemNameChange'] = (id, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      places: currentForm.places.map((item) => (item.id === id ? { ...item, name: value } : item)),
    }))
  }

  const handlePlaceItemDescriptionChange: AreaEditPageState['handlePlaceItemDescriptionChange'] = (id, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      places: currentForm.places.map((item) => (item.id === id ? { ...item, description: value } : item)),
    }))
  }

  const handleSubmit: AreaEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const area = await saveArea(areaId, form)
      const nextArea: AreaData = {
        uniqueId: area.uniqueId,
        name: area.name,
        description: area.description,
        places: clonePlaceItems(area.places),
      }
      setForm(nextArea)
      setSavedArea({ ...nextArea, places: clonePlaceItems(nextArea.places) })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const handleBackToListClick = () => {
    handleTabChange('areas')
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
