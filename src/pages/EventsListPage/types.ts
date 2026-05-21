import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Event } from '@appTypes/event'

export interface EventListCardViewModel {
  id: string
  deleting: boolean
  description: string
  label: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface EventsListPageState {
  cards: EventListCardViewModel[]
  creating: boolean
  deleteDialogEventName: string
  deletingId: string
  error: string
  eventToDelete: Event | null
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteEvent: () => Promise<void>
  handleCreateEvent: () => Promise<void>
  handleOpenDeleteDialog: (event: Event) => void
  loading: boolean
  showEmptyState: boolean
  showEventGrid: boolean
}

export type EventsListPageStateAction = FormEventHandler<HTMLFormElement>
