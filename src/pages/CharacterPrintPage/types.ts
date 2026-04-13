import type { Character, CharacterAbility, CharacterItems } from '../../types/character'

export type CharacterItemGroupKey = keyof CharacterItems

export interface PrintAttributeRow {
  key: keyof Character['attributes']
  label: string
  value: number
  modifier: number
}

export interface PrintDefenseRow {
  key: keyof Character['defenses']
  label: string
  value: number
}

export interface PrintSkillRow {
  key: keyof Character['training']
  label: string
  value: number
  trained: boolean
}

export interface PrintItemRow {
  key: string
  name: string
  description: string
}

export interface CharacterPrintPageState {
  loading: boolean
  error: string
  character: Character | null
  levelBonus: number
  speedValue: number
  hpValue: number
  surgeValue: number
  attributeRows: PrintAttributeRow[]
  defenseRows: PrintDefenseRow[]
  skillRows: PrintSkillRow[]
  abilityRows: CharacterAbility[]
  itemRows: Record<CharacterItemGroupKey, PrintItemRow[]>
}
