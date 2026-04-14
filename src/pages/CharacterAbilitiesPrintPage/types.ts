import type { CharacterAbility, Character } from '../../types/character'

export type PrintAbilityType = CharacterAbility['type']
export type PrintAbilityKind = CharacterAbility['kind']

export interface PrintAbilityDetailRow {
  label: string
  value: string
}

export interface PrintFeatRow {
  key: string
  name: string
  description: string
}

export interface PrintAbilityRow {
  key: string
  name: string
  description: string
  meta: string[]
  action: CharacterAbility['action']
  type: PrintAbilityType
  kind: PrintAbilityKind
  weaponAttackAttribute: CharacterAbility['weaponAttackAttribute']
  weaponAttackDefense: CharacterAbility['weaponAttackDefense']
  weaponAttackDisplay: string
  damage: string
  details: PrintAbilityDetailRow[]
  offensiveNotes: PrintAbilityDetailRow[]
}

export interface CharacterAbilitiesPrintPageState {
  loading: boolean
  error: string
  character: Character | null
  abilityRows: PrintAbilityRow[]
  featRows: PrintFeatRow[]
  abilityCount: number
  featCount: number
  hasAbilities: boolean
  hasFeats: boolean
  title: string
}
