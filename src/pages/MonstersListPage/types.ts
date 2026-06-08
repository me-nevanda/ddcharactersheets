import type { SubmitEventHandler, KeyboardEventHandler, MouseEvent, MouseEventHandler } from 'react'
import type { Monster, MonsterGroup } from '@appTypes/monster'
import type { MainMonsterListTabKey } from '@pages/main/types'

export type MonsterListTabKey = MainMonsterListTabKey

export interface MonsterListCardViewModel {
  descriptionPreview: string
  deleting: boolean
  id: string
  imageSrc: string
  isElite: boolean
  isMinion: boolean
  isNormal: boolean
  isSolo: boolean
  label: string
  level: number
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
  roleLabel: string
  typeLabel: string
}

export interface MonsterGroupCardViewModel {
  deleting: boolean
  id: string
  monsterCount: number
  hasMoreMonsters: boolean
  monsterThumbnails: MonsterGroupThumbnailViewModel[]
  name: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface MonsterGroupThumbnailViewModel {
  id: string
  imageSrc: string
  label: string
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: (event: MouseEvent<HTMLElement>) => void
}

export interface CreateMonsterGroupDialogProps {
  creatingGroup: boolean
  groupName: string
  onCancel: () => void
  onChangeGroupName: (value: string) => void
  onSubmit: SubmitEventHandler<HTMLFormElement>
}

export interface MonstersListPageState {
  cards: MonsterListCardViewModel[]
  creating: boolean
  creatingGroup: boolean
  deletingId: string
  groupDeletingId: string
  groupToDelete: MonsterGroup | null
  deleteDialogMonsterName: string
  deleteDialogGroupName: string
  error: string
  groupName: string
  groupSearch: string
  groups: MonsterGroupCardViewModel[]
  handleCancelCreateGroup: () => void
  handleChangeGroupName: (value: string) => void
  handleChangeGroupSearch: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteMonster: () => Promise<void>
  handleCloseDeleteGroupDialog: () => void
  handleConfirmDeleteMonsterGroup: () => Promise<void>
  handleCreateGroupSubmit: SubmitEventHandler<HTMLFormElement>
  handleCreateMonster: () => Promise<void>
  handleOpenCreateGroupDialog: () => void
  handleChangeListSearch: (value: string) => void
  listSearch: string
  loading: boolean
  loadingGroups: boolean
  monsterToDelete: Monster | null
  activeTab: MonsterListTabKey
  setActiveTab: (tab: MonsterListTabKey) => void
  showCreateGroupDialog: boolean
  showEmptyState: boolean
  showEmptySearchState: boolean
  showEmptyGroupsState: boolean
  showEmptyGroupSearchState: boolean
  showGroupList: boolean
  showMonsterGrid: boolean
}
