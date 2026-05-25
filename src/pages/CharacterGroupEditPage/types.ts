import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler, SyntheticEvent } from 'react'

export interface CharacterGroupCharacterViewModel {
  classLabel: string
  classSrc: string
  descriptionPreview: string
  fileName: string
  id: string
  imageSrc: string
  label: string
  level: number
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onOpen: () => void
  portraitSrc: string
  raceLabel: string
}

export interface CharacterGroupCharacterOptionViewModel extends CharacterGroupCharacterViewModel {
  onAddClick: MouseEventHandler<HTMLButtonElement>
}

export interface AssignedCharacterGroupCharacterViewModel extends CharacterGroupCharacterViewModel {
  onRemoveClick: MouseEventHandler<HTMLButtonElement>
}

export interface CharacterGroupEditPageState {
  assignedCharacters: AssignedCharacterGroupCharacterViewModel[]
  assignedCharacterSearch: string
  characterOptions: CharacterGroupCharacterOptionViewModel[]
  characterSearch: string
  error: string
  groupName: string
  handleChangeAssignedCharacterSearch: (value: string) => void
  handleChangeCharacterSearch: (value: string) => void
  handleChangeGroupName: (value: string) => void
  handleSubmit: FormEventHandler<HTMLFormElement>
  hasChanges: boolean
  loading: boolean
  saving: boolean
}
