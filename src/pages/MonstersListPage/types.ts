import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'
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
  imageSrc: string
  label: string
}

export interface CreateMonsterGroupDialogProps {
  creatingGroup: boolean
  groupName: string
  onCancel: () => void
  onChangeGroupName: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
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
  groups: MonsterGroupCardViewModel[]
  handleCancelCreateGroup: () => void
  handleChangeGroupName: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteMonster: () => Promise<void>
  handleCloseDeleteGroupDialog: () => void
  handleConfirmDeleteMonsterGroup: () => Promise<void>
  handleCreateGroupSubmit: FormEventHandler<HTMLFormElement>
  handleCreateMonster: () => Promise<void>
  handleOpenCreateGroupDialog: () => void
  loading: boolean
  loadingGroups: boolean
  monsterToDelete: Monster | null
  activeTab: MonsterListTabKey
  setActiveTab: (tab: MonsterListTabKey) => void
  showCreateGroupDialog: boolean
  showEmptyState: boolean
  showEmptyGroupsState: boolean
  showGroupList: boolean
  showMonsterGrid: boolean
}
