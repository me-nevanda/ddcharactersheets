import type { KeyboardEventHandler } from 'react'

export interface AdventureListCardViewModel {
  id: string
  label: string
  promptPreview: string
  updatedAtLabel: string
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface AdventureListPageState {
  cards: AdventureListCardViewModel[]
  creating: boolean
  error: string
  handleCreateAdventure: () => Promise<void>
  loading: boolean
  showAdventureGrid: boolean
  showEmptyState: boolean
}
