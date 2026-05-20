import type { FormEventHandler, MouseEventHandler } from 'react'

export interface MonsterGroupMonsterViewModel {
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

export interface MonsterGroupMonsterOptionViewModel extends MonsterGroupMonsterViewModel {
  onAddClick: MouseEventHandler<HTMLButtonElement>
}

export interface AssignedMonsterGroupMonsterViewModel extends MonsterGroupMonsterViewModel {
  onRemoveClick: MouseEventHandler<HTMLButtonElement>
}

export interface MonsterGroupEditPageState {
  assignedMonsters: AssignedMonsterGroupMonsterViewModel[]
  error: string
  groupName: string
  handleChangeGroupName: (value: string) => void
  handleChangeAssignedMonsterSearch: (value: string) => void
  handleChangeMonsterSearch: (value: string) => void
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  loading: boolean
  monsterOptions: MonsterGroupMonsterOptionViewModel[]
  monsterSearch: string
  assignedMonsterSearch: string
  saving: boolean
}
