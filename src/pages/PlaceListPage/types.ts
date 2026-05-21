import type { KeyboardEventHandler } from 'react'

export interface PlaceListCardViewModel {
  id: string
  label: string
  descriptionPreview: string
  updatedAtLabel: string
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface PlaceListPageState {
  cards: PlaceListCardViewModel[]
  creating: boolean
  error: string
  handleCreatePlace: () => Promise<void>
  loading: boolean
  showPlaceGrid: boolean
  showEmptyState: boolean
}
