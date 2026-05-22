import type { KeyboardEventHandler } from 'react'

export interface AreaListCardViewModel {
  id: string
  label: string
  descriptionPreview: string
  updatedAtLabel: string
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface AreaListPageState {
  cards: AreaListCardViewModel[]
  creating: boolean
  error: string
  handleCreateArea: () => Promise<void>
  loading: boolean
  showAreaGrid: boolean
  showEmptyState: boolean
}
