import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { ContextData } from '@appTypes/context'

export interface ContextCharacterCardViewModel {
  id: string
  label: string
  raceLabel: string
  classLabel: string
  level: number
  imageSrc: string
  portraitSrc: string
  classSrc: string
  hasCustomImage: boolean
  onRemoveClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextCharacterOptionViewModel {
  id: string
  label: string
  raceLabel: string
  classLabel: string
  level: number
  imageSrc: string
  portraitSrc: string
  classSrc: string
  hasCustomImage: boolean
  onToggleSelected: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  selected: boolean
}

export interface ContextNpcCardViewModel {
  id: string
  label: string
  roleLabel: string
  typeLabel: string
  level: number
  imageSrc: string
  isStory: boolean
  isElite: boolean
  isMinion: boolean
  isNormal: boolean
  isSolo: boolean
  isDead: boolean
  storyLabel: string
  onRemoveClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextNpcGroupSectionViewModel {
  id: string
  name: string
  npcs: ContextNpcCardViewModel[]
  onRemoveGroupClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextNpcGroupOptionViewModel {
  id: string
  label: string
  npcCount: number
  npcCountLabel: string
  onToggleSelected: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  selected: boolean
}

export interface ContextMonsterCardViewModel {
  id: string
  label: string
  roleLabel: string
  typeLabel: string
  level: number
  imageSrc: string
  isElite: boolean
  isMinion: boolean
  isNormal: boolean
  isSolo: boolean
  onRemoveClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextMonsterGroupSectionViewModel {
  id: string
  name: string
  monsters: ContextMonsterCardViewModel[]
  onRemoveGroupClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextMonsterGroupOptionViewModel {
  id: string
  label: string
  monsterCount: number
  monsterCountLabel: string
  onToggleSelected: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  selected: boolean
}

export interface ContextEditPageState {
  error: string
  form: ContextData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  loading: boolean
  saving: boolean
  characterCards: ContextCharacterCardViewModel[]
  characterOptions: ContextCharacterOptionViewModel[]
  characterSearch: string
  handleChangeCharacterSearch: (value: string) => void
  isAddCharacterDialogOpen: boolean
  handleOpenAddCharacterDialog: () => void
  handleCloseAddCharacterDialog: () => void
  handleConfirmAddCharacters: () => void
  selectedCharacterIdsInDialog: string[]
  hasSelectedCharactersInDialog: boolean
  npcGroupSections: ContextNpcGroupSectionViewModel[]
  npcGroupOptions: ContextNpcGroupOptionViewModel[]
  npcGroupSearch: string
  handleChangeNpcGroupSearch: (value: string) => void
  isAddNpcGroupDialogOpen: boolean
  handleOpenAddNpcGroupDialog: () => void
  handleCloseAddNpcGroupDialog: () => void
  handleConfirmAddNpcGroups: () => void
  selectedNpcGroupIdsInDialog: string[]
  hasSelectedNpcGroupsInDialog: boolean
  monsterGroupSections: ContextMonsterGroupSectionViewModel[]
  monsterGroupOptions: ContextMonsterGroupOptionViewModel[]
  monsterGroupSearch: string
  handleChangeMonsterGroupSearch: (value: string) => void
  isAddMonsterGroupDialogOpen: boolean
  handleOpenAddMonsterGroupDialog: () => void
  handleCloseAddMonsterGroupDialog: () => void
  handleConfirmAddMonsterGroups: () => void
  selectedMonsterGroupIdsInDialog: string[]
  hasSelectedMonsterGroupsInDialog: boolean
}
