import type { ChangeEvent, FormEvent } from 'react'
import type { EventData } from '@appTypes/event'

export interface EventEditPageState {
  error: string
  form: EventData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  loading: boolean
  saving: boolean
}
