import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Area } from '@appTypes/area'

export interface AreaListCardViewModel {
  id: string
  deleting: boolean
  imageUrl: string
  label: string
  descriptionPreview: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  updatedAtLabel: string
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface AreaListPageState {
  cards: AreaListCardViewModel[]
  areaToDelete: Area | null
  creating: boolean
  deleteDialogAreaName: string
  deletingId: string
  error: string
  handleChangeListSearch: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteArea: () => Promise<void>
  handleCreateArea: () => Promise<void>
  listSearch: string
  loading: boolean
  showAreaGrid: boolean
  showEmptySearchState: boolean
  showEmptyState: boolean
}
