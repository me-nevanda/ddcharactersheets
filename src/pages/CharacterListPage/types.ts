import type { FormEventHandler, KeyboardEventHandler, MouseEvent, MouseEventHandler, SyntheticEvent } from 'react'
import type { Character, CharacterGroup } from '@appTypes/character'
import type { MainCharacterListTabKey } from '@pages/main/types'

export type CharacterListTabKey = MainCharacterListTabKey

export interface CharacterListCardViewModel {
  id: string
  alignmentLabel: string
  classLabel: string
  deleting: boolean
  description: string
  genderLabel: string
  label: string
  level: number
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
  imageSrc: string
  portraitSrc: string
  raceLabel: string
  classSrc: string
}

export interface CharacterGroupCardViewModel {
  characterCount: number
  characterThumbnails: CharacterGroupThumbnailViewModel[]
  deleting: boolean
  hasMoreCharacters: boolean
  id: string
  name: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface CharacterGroupThumbnailViewModel {
  id: string
  imageSrc: string
  label: string
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: (event: MouseEvent<HTMLElement>) => void
  portraitSrc: string
  classSrc: string
}

export interface CreateCharacterGroupDialogProps {
  creatingGroup: boolean
  groupName: string
  onCancel: () => void
  onChangeGroupName: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export interface CharacterListPageState {
  activeTab: CharacterListTabKey
  cards: CharacterListCardViewModel[]
  creating: boolean
  creatingGroup: boolean
  deleteDialogCharacterName: string
  deleteDialogGroupName: string
  deletingId: string
  error: string
  groupDeletingId: string
  groupName: string
  groups: CharacterGroupCardViewModel[]
  groupToDelete: CharacterGroup | null
  handleCancelCreateGroup: () => void
  handleCardImageError: (event: SyntheticEvent<HTMLImageElement>) => void
  handleChangeGroupName: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleCloseDeleteGroupDialog: () => void
  handleConfirmDeleteCharacter: () => Promise<void>
  handleConfirmDeleteCharacterGroup: () => Promise<void>
  handleCreateGroupSubmit: FormEventHandler<HTMLFormElement>
  handleCreateCharacter: () => Promise<void>
  handleOpenCreateGroupDialog: () => void
  handleOpenDeleteDialog: (character: Character) => void
  loading: boolean
  loadingGroups: boolean
  characterToDelete: Character | null
  setActiveTab: (tab: CharacterListTabKey) => void
  showCreateGroupDialog: boolean
  showCharacterGrid: boolean
  showEmptyGroupsState: boolean
  showEmptyState: boolean
  showGroupList: boolean
}
