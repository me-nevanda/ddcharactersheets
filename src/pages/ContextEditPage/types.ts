import type { ChangeEvent, FormEvent } from 'react'
import type { ContextData } from '@appTypes/context'

export interface ContextEditPageState {
  error: string
  form: ContextData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  loading: boolean
  saving: boolean
}
