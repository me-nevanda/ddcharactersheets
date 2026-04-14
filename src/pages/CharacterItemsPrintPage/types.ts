import type { Character } from '../../types/character'

export interface PrintItemRow {
  key: string
  name: string
  description: string
}

export interface CharacterItemsPrintPageState {
  loading: boolean
  error: string
  character: Character | null
  title: string
  hasItems: boolean
  armors: PrintItemRow[]
  weapons: PrintItemRow[]
  others: PrintItemRow[]
}
