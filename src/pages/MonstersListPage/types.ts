import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Monster } from '@appTypes/monster'

export interface MonsterListCardViewModel {
  descriptionPreview: string
  deleting: boolean
  id: string
  imageSrc: string
  label: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface MonstersListPageState {
  cards: MonsterListCardViewModel[]
  creating: boolean
  deletingId: string
  deleteDialogMonsterName: string
  error: string
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteMonster: () => Promise<void>
  handleCreateMonster: () => Promise<void>
  loading: boolean
  monsterToDelete: Monster | null
  showEmptyState: boolean
  showMonsterGrid: boolean
}
