import type { Character } from '../../types/character'

export interface CharacterListPageState {
  characters: Character[]
  creating: boolean
  deletingId: string
  error: string
  loading: boolean
  characterToDelete: Character | null
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteCharacter: () => Promise<void>
  handleCreateCharacter: () => Promise<void>
  handleOpenDeleteDialog: (character: Character) => void
}
