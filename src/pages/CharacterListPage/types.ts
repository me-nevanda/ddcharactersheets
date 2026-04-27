import type { KeyboardEventHandler, MouseEventHandler, SyntheticEvent } from 'react'
import type { Character } from '../../types/character'

export interface CharacterListCardViewModel {
  id: string
  alignmentLabel: string
  classLabel: string
  deleting: boolean
  genderLabel: string
  label: string
  level: number
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
  portraitSrc: string
  raceLabel: string
  classSrc: string
}

export interface CharacterListPageState {
  cards: CharacterListCardViewModel[]
  creating: boolean
  deleteDialogCharacterName: string
  deletingId: string
  error: string
  handleCardImageError: (event: SyntheticEvent<HTMLImageElement>) => void
  loading: boolean
  characterToDelete: Character | null
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteCharacter: () => Promise<void>
  handleCreateCharacter: () => Promise<void>
  handleOpenDeleteDialog: (character: Character) => void
  showCharacterGrid: boolean
  showEmptyState: boolean
}
