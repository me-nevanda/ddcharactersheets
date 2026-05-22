import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { Area } from '@appTypes/area'
import type { Character } from '@appTypes/character'
import type { ContextData } from '@appTypes/context'
import type { Event } from '@appTypes/event'
import type { Monster } from '@appTypes/monster'
import type { Npc } from '@appTypes/npc'

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

export interface ContextPlaceCardViewModel {
  id: string
  label: string
  descriptionPreview: string
  onRemoveClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextAreaSectionViewModel {
  id: string
  name: string
  places: ContextPlaceCardViewModel[]
  onRemoveAreaClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextAreaOptionViewModel {
  id: string
  label: string
  placeCount: number
  placeCountLabel: string
  onToggleSelected: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  selected: boolean
}

export interface ContextEventCardViewModel {
  id: string
  label: string
  descriptionPreview: string
  onRemoveClick: (event: ReactMouseEvent<HTMLButtonElement>) => void
}

export interface ContextEventOptionViewModel {
  id: string
  label: string
  descriptionPreview: string
  onToggleSelected: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  selected: boolean
}

export interface UseContextCopyParams {
  areas: Area[]
  characters: Character[]
  contextId: string
  events: Event[]
  form: ContextData
  monsters: Monster[]
  npcs: Npc[]
  onClearError: () => void
  onError: (message: string) => void
  saveCurrentContext: () => Promise<ContextData>
}

export interface ContextCopyState {
  copyingContext: boolean
  copyStatus: string
  handleCopyContext: () => Promise<void>
}

export interface ContextEditPageState {
  error: string
  copyStatus: string
  copyingContext: boolean
  form: ContextData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleChangeDescription: (value: string) => void
  handleCopyContext: () => Promise<void>
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
  areaSections: ContextAreaSectionViewModel[]
  areaOptions: ContextAreaOptionViewModel[]
  areaSearch: string
  handleChangeAreaSearch: (value: string) => void
  isAddAreaDialogOpen: boolean
  handleOpenAddAreaDialog: () => void
  handleCloseAddAreaDialog: () => void
  handleConfirmAddAreas: () => void
  selectedAreaIdsInDialog: string[]
  hasSelectedAreasInDialog: boolean
  eventCards: ContextEventCardViewModel[]
  eventOptions: ContextEventOptionViewModel[]
  eventSearch: string
  handleChangeEventSearch: (value: string) => void
  isAddEventDialogOpen: boolean
  handleOpenAddEventDialog: () => void
  handleCloseAddEventDialog: () => void
  handleConfirmAddEvents: () => void
  selectedEventIdsInDialog: string[]
  hasSelectedEventsInDialog: boolean
}
