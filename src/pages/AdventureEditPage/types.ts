import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { AdventureData } from '@appTypes/adventure'

export interface AdventureEditPageState {
  error: string
  form: AdventureData
  handleBackToListClick: () => void
  handleFieldChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  handleSendClick: () => void
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  lastUsageLabel: string
  loading: boolean
  promptTokenLabel: string
  quotaResetLabel: string
  saving: boolean
  todayRequestsLabel: string
}
