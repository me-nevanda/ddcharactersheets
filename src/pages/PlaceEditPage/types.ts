import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { PlaceData, PlaceItem } from '@appTypes/place'

export interface PlaceEditPageState {
  error: string
  form: PlaceData
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
