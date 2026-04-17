import type { ChangeEvent, FormEvent } from 'react'
import type {
  CharacterAbility,
  Character,
  CharacterBonuses,
  CharacterAttributes,
  CharacterArmorBonusFieldName,
  CharacterDefenses,
  CharacterItemBase,
  CharacterItems,
  CharacterItemBonusFieldName,
  CharacterFeat,
  CharacterWeaponFieldName,
  CharacterWeaponDamageDiceType,
  CharacterTraining,
} from '../../types/character'

export interface CharacterEditFormData extends Omit<Character, 'id' | 'updatedAt'> {
  bonuses: CharacterBonuses
}

export type CharacterGeneralFieldName = 'name' | 'level' | 'race' | 'class'

export type CharacterAttributeFieldName = keyof CharacterAttributes

export type CharacterSkillFieldName = keyof CharacterTraining

export type CharacterGeneralChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>

export type CharacterAbilityFieldName = keyof CharacterAbility

export type CharacterFeatFieldName = Exclude<keyof CharacterFeat, 'id'>

export type CharacterItemFieldName = keyof CharacterItemBase | 'equipped'

export type CharacterItemGroupKey = keyof CharacterItems

export type CharacterEditTabKey = 'general' | 'abilities' | 'feats' | 'items'

export interface AttributeRow {
  key: CharacterAttributeFieldName
  value: number
  modifierLabel: string
}

export type SkillModifierMap = Record<CharacterSkillFieldName, string>

export interface CharacterEditPageState {
  error: string
  form: CharacterEditFormData
  loading: boolean
  saving: boolean
  attributeBonuses: CharacterAttributes
  attributeBonusTooltips: Record<CharacterAttributeFieldName, string>
  handleGeneralChange: (event: CharacterGeneralChangeEvent) => void
  handleAttributeChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleTrainingChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleAbilityCreateEmpty: () => void
  handleAbilityAdd: (ability: CharacterAbility) => void
  handleAbilityChange: (index: number, fieldName: CharacterAbilityFieldName, value: string | number) => void
  handleAbilityRemove: (index: number) => void
  handleFeatCreateEmpty: () => void
  handleFeatChange: (index: number, fieldName: CharacterFeatFieldName, value: string | number | boolean) => void
  handleFeatRemove: (index: number) => void
  handleItemCreateEmpty: (group: CharacterItemGroupKey) => void
  handleItemChange: (
    group: CharacterItemGroupKey,
    index: number,
    fieldName: CharacterItemFieldName | CharacterItemBonusFieldName,
    value: string | number | boolean,
  ) => void
  handleItemBonusFieldChange: (
    group: CharacterItemGroupKey,
    index: number,
    previousFieldName: CharacterArmorBonusFieldName,
    nextFieldName: CharacterArmorBonusFieldName,
  ) => void
  handleArmorBonusChange: (
    index: number,
    fieldName: CharacterArmorBonusFieldName,
    value: number,
  ) => void
  handleWeaponDamageChange: (
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) => void
  handleItemRemove: (group: CharacterItemGroupKey, index: number) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  attributeRows: AttributeRow[]
  skillModifiers: SkillModifierMap
  levelBonusLabel: string
  speedValue: number
  speedTooltip: string
  hpTooltip: string
  defenseValues: DefenseValues
  defenseTooltips: DefenseTooltipValues
  hpValue: number
  surgeValue: number
  hasChanges: boolean
}

export interface DefenseValues {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface DefenseTooltipValues {
  kp: string
  fortitude: string
  reflex: string
  will: string
}
