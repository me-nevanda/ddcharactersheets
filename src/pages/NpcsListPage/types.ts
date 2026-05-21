import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'
import type { Npc, NpcGroup } from '@appTypes/npc'
import type { MainNpcListTabKey } from '@pages/main/types'

export type NpcListTabKey = MainNpcListTabKey

export interface NpcListCardViewModel {
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

export interface NpcGroupCardViewModel {
  deleting: boolean
  id: string
  npcCount: number
  hasMoreNpcs: boolean
  npcThumbnails: NpcGroupThumbnailViewModel[]
  name: string
  onDeleteClick: MouseEventHandler<HTMLButtonElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
}

export interface NpcGroupThumbnailViewModel {
  imageSrc: string
  label: string
}

export interface CreateNpcGroupDialogProps {
  creatingGroup: boolean
  groupName: string
  onCancel: () => void
  onChangeGroupName: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export interface NpcsListPageState {
  cards: NpcListCardViewModel[]
  creating: boolean
  creatingGroup: boolean
  deletingId: string
  groupDeletingId: string
  groupToDelete: NpcGroup | null
  deleteDialogNpcName: string
  deleteDialogGroupName: string
  error: string
  groupName: string
  groups: NpcGroupCardViewModel[]
  handleCancelCreateGroup: () => void
  handleChangeGroupName: (value: string) => void
  handleCloseDeleteDialog: () => void
  handleConfirmDeleteNpc: () => Promise<void>
  handleCloseDeleteGroupDialog: () => void
  handleConfirmDeleteNpcGroup: () => Promise<void>
  handleCreateGroupSubmit: FormEventHandler<HTMLFormElement>
  handleCreateNpc: () => Promise<void>
  handleOpenCreateGroupDialog: () => void
  loading: boolean
  loadingGroups: boolean
  npcToDelete: Npc | null
  activeTab: NpcListTabKey
  setActiveTab: (tab: NpcListTabKey) => void
  showCreateGroupDialog: boolean
  showEmptyState: boolean
  showEmptyGroupsState: boolean
  showGroupList: boolean
  showNpcGrid: boolean
}
