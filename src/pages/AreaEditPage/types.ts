import type { ChangeEvent, ChangeEventHandler, FormEventHandler } from 'react'
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
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleCancelImageRemove: () => void
  handleConfirmImageRemove: () => Promise<void>
  handleRequestImageRemove: () => void
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  imageUrl: string
  isImageRemoveDialogOpen: boolean
  loading: boolean
  removingImage: boolean
  saving: boolean
  uploadingImage: boolean
}

export type { PlaceItem }
