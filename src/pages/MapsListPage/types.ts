import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Map } from '@appTypes/map'

export interface MapListCardViewModel {
  id: string
  deleting: boolean
  description: string
  label: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface MapsListPageState {
  cards: MapListCardViewModel[]
  creating: boolean
  deleteDialogMapName: string
  deletingId: string
  error: string
  handleChangeListSearch: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteMap: () => Promise<void>
  handleCreateMap: () => Promise<void>
  listSearch: string
  loading: boolean
  mapToDelete: Map | null
  showEmptySearchState: boolean
  showEmptyState: boolean
  showMapGrid: boolean
}
