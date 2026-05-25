import type { ChangeEvent, FormEvent } from 'react'
import type { EventData } from '@appTypes/event'

export interface EventEditPageState {
  error: string
  form: EventData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleCancelImageRemove: () => void
  handleConfirmImageRemove: () => Promise<void>
  handleRequestImageRemove: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  imageUrl: string
  isImageRemoveDialogOpen: boolean
  loading: boolean
  removingImage: boolean
  saving: boolean
  uploadingImage: boolean
}
