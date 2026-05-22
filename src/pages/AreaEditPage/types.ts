import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { AreaData, PlaceItem } from '@appTypes/area'

export interface AreaEditPageState {
  error: string
  form: AreaData
  handleBackToListClick: () => void
  handleNameChange: ChangeEventHandler<HTMLInputElement>
  handleDescriptionChange: (value: string) => void
  handleAddPlaceItem: () => void
  handleRequestRemovePlaceItem: (id: string) => void
  handleCancelRemovePlaceItem: () => void
  handleConfirmRemovePlaceItem: () => void
  placeItemToRemove: PlaceItem | null
  handlePlaceItemNameChange: (id: string, value: string) => void
  handlePlaceItemDescriptionChange: (id: string, value: string) => void
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  loading: boolean
  saving: boolean
}

export type { PlaceItem }
