import type {
  CharacterAbility,
  CharacterAbilityAreaType,
  CharacterAbilityType,
  CharacterAbilityKind,
  CharacterWeaponDamageType,
  CharacterAttributes,
  CharacterDefenses,
} from '../../../../types/character'

export interface PendingAbilityRemoval {
  index: number
  name: string
}

export interface SelectOption<TValue extends string | number> {
  value: TValue
  label: string
}

export interface AbilityCardProps {
  ability: CharacterAbility
  index: number
  attributeOptions: SelectOption<keyof CharacterAttributes>[]
  attackBonusOptions: number[]
  defenseOptions: SelectOption<keyof CharacterDefenses>[]
  weaponAreaOptions: SelectOption<CharacterAbilityAreaType>[]
  weaponDamageTypeOptions: SelectOption<CharacterWeaponDamageType>[]
  weaponOptions: string[]
  getAbilityHeaderClass: (type: CharacterAbilityType) => string
  onAbilityChange: (index: number, fieldName: keyof CharacterAbility, value: string | number) => void
  onRemoveAbility: (index: number, abilityName: string) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

export interface AbilityActionFieldsProps {
  ability: CharacterAbility
  index: number
  weaponAreaOptions: SelectOption<CharacterAbilityAreaType>[]
  onAbilityChange: (index: number, fieldName: keyof CharacterAbility, value: string | number) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

export interface AbilityOffensiveFieldsProps {
  ability: CharacterAbility
  index: number
  attributeOptions: SelectOption<keyof CharacterAttributes>[]
  attackBonusOptions: number[]
  defenseOptions: SelectOption<keyof CharacterDefenses>[]
  weaponDamageTypeOptions: SelectOption<CharacterWeaponDamageType>[]
  weaponOptions: string[]
  onAbilityChange: (index: number, fieldName: keyof CharacterAbility, value: string | number) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

export interface AbilityRemoveDialogProps {
  pendingRemoval: PendingAbilityRemoval | null
  onCancel: () => void
  onConfirm: () => void
  t: (key: string, variables?: Record<string, string | number>) => string
}
