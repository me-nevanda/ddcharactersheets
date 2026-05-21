import type { FormEventHandler, MouseEventHandler } from 'react'

export interface NpcGroupNpcViewModel {
  descriptionPreview: string
  fileName: string
  id: string
  imageSrc: string
  isElite: boolean
  isMinion: boolean
  isNormal: boolean
  isSolo: boolean
  label: string
  level: number
  roleLabel: string
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
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  loading: boolean
  npcOptions: NpcGroupNpcOptionViewModel[]
  npcSearch: string
  assignedNpcSearch: string
  saving: boolean
}
