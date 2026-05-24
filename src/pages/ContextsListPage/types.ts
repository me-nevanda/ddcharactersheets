import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Context } from '@appTypes/context'

export interface ContextListCardViewModel {
  id: string
  deleting: boolean
  description: string
  imageUrl: string
  label: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface ContextsListPageState {
  cards: ContextListCardViewModel[]
  creating: boolean
  deleteDialogContextName: string
  deletingId: string
  error: string
  contextToDelete: Context | null
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteContext: () => Promise<void>
  handleCreateContext: () => Promise<void>
  handleOpenDeleteDialog: (context: Context) => void
  loading: boolean
  showEmptyState: boolean
  showContextGrid: boolean
}
