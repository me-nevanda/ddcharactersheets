import type { SubmitEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'

export interface NpcGroupNpcViewModel {
  descriptionPreview: string
  fileName: string
  id: string
  imageSrc: string
  isDead: boolean
  isElite: boolean
  isMinion: boolean
  isNormal: boolean
  isSolo: boolean
  isStory: boolean
  label: string
  level: number
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
  roleLabel: string
  storyLabel: string
  typeLabel: string
}

export interface NpcGroupNpcOptionViewModel extends NpcGroupNpcViewModel {
  onAddClick: MouseEventHandler<HTMLButtonElement>
}

export interface AssignedNpcGroupNpcViewModel extends NpcGroupNpcViewModel {
  onRemoveClick: MouseEventHandler<HTMLButtonElement>
}

export interface NpcGroupEditPageState {
  assignedNpcs: AssignedNpcGroupNpcViewModel[]
  error: string
  groupName: string
  handleChangeGroupName: (value: string) => void
  handleChangeAssignedNpcSearch: (value: string) => void
  handleChangeNpcSearch: (value: string) => void
  handleSubmit: SubmitEventHandler<HTMLFormElement>
  hasChanges: boolean
  loading: boolean
  npcOptions: NpcGroupNpcOptionViewModel[]
  npcSearch: string
  assignedNpcSearch: string
  saving: boolean
}
