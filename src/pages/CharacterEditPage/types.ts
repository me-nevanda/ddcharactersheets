import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import type {
  CharacterAbility,
  CharacterAbilityType,
  Character,
  CharacterAttributeBonuses,
  CharacterBonuses,
  CharacterAttributes,
  CharacterArmorBonusFieldName,
  CharacterItemBase,
  CharacterItems,
  CharacterItemBonusFieldName,
  CharacterFeat,
  CharacterHistoryEntry,
  CharacterSkillBonuses,
  CharacterWeaponFieldName,
  CharacterWeaponDamageDiceType,
  CharacterTraining,
} from '@appTypes/character'
import type { CharacterFeatBonusFieldName } from './featsLogic'
import type { AttributeRow } from './sections/AttributesSection/types'
import type { DefenseTooltipValues, DefenseValues } from './sections/DefensesSection/types'

export interface CharacterEditFormData extends Omit<Character, 'id' | 'updatedAt'> {
  bonuses: CharacterBonuses
}

export type CharacterGeneralFieldName = 'name' | 'shortDescription' | 'description' | 'level' | 'race' | 'class' | 'gender' | 'alignment'

export type CharacterAttributeFieldName = keyof CharacterAttributes

export type CharacterSkillFieldName = keyof CharacterTraining

export type CharacterGeneralChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

export type CharacterAbilityFieldName = keyof CharacterAbility

export type CharacterFeatFieldName = Exclude<keyof CharacterFeat, 'id'>

export type CharacterItemFieldName = Exclude<keyof CharacterItemBase, 'id'> | 'equipped'

export type CharacterItemGroupKey = keyof CharacterItems

export type CharacterEditTabKey = 'general' | 'abilities' | 'feats' | 'items' | 'history'

export type SkillModifierMap = Record<CharacterSkillFieldName, string>

export interface CharacterEditPageState {
  error: string
  form: CharacterEditFormData
  loading: boolean
  saving: boolean
  historyEntries: CharacterHistoryEntry[]
  attributeBonuses: CharacterAttributes
  attributeBonusTooltips: Record<CharacterAttributeFieldName, string>
  handleGeneralChange: (event: CharacterGeneralChangeEvent) => void
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleImageRemove: () => Promise<void>
  handleGeneralFieldChange: (fieldName: CharacterGeneralFieldName, value: string) => void
  handleAttributeChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleTrainingChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleAbilityCreateEmpty: (type?: CharacterAbilityType) => void
  handleAbilityAdd: (ability: CharacterAbility) => void
  handleAbilityChange: (index: number, fieldName: CharacterAbilityFieldName, value: string | number) => void
  handleAbilityRemove: (index: number) => void
  handleFeatCreateEmpty: () => void
  handleFeatChange: (index: number, fieldName: CharacterFeatFieldName, value: string | number | boolean) => void
  handleFeatBonusFieldChange: (
    index: number,
    previousFieldName: CharacterFeatBonusFieldName,
    nextFieldName: CharacterFeatBonusFieldName,
  ) => void
  handleFeatRemove: (index: number) => void
  handleHistoryEntryCreateEmpty: () => void
  handleHistoryEntryChange: (index: number, fieldName: CharacterHistoryEntryFieldName, value: string) => void
  handleHistoryEntryRemove: (index: number) => void
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
  imageUrl: string
  removingImage: boolean
  surgeValue: number
  uploadingImage: boolean
  hasChanges: boolean
}

export type CharacterEditPageSetForm = Dispatch<SetStateAction<CharacterEditFormData>>
export type CharacterEditPageSetHistoryEntries = Dispatch<SetStateAction<CharacterHistoryEntry[]>>

export type CharacterEditPageSetBoolean = Dispatch<SetStateAction<boolean>>

export type CharacterEditPageSetString = Dispatch<SetStateAction<string>>

export type CharacterEditPageHandlerKeys =
  | 'handleGeneralChange'
  | 'handleGeneralFieldChange'
  | 'handleAttributeChange'
  | 'handleTrainingChange'
  | 'handleAbilityCreateEmpty'
  | 'handleAbilityAdd'
  | 'handleAbilityChange'
  | 'handleAbilityRemove'
  | 'handleFeatCreateEmpty'
  | 'handleFeatChange'
  | 'handleFeatBonusFieldChange'
  | 'handleFeatRemove'
  | 'handleItemCreateEmpty'
  | 'handleItemChange'
  | 'handleItemBonusFieldChange'
  | 'handleArmorBonusChange'
  | 'handleWeaponDamageChange'
  | 'handleItemRemove'

export type CharacterEditPageHandlers = Pick<CharacterEditPageState, CharacterEditPageHandlerKeys>

export interface CharacterEditPageComputedState {
  attributeBonuses: CharacterAttributes
  attributeBonusTooltips: Record<CharacterAttributeFieldName, string>
  attributeModifierMap: CharacterAttributeBonuses
  attributeRows: AttributeRow[]
  defenseTooltips: DefenseTooltipValues
  defenseValues: DefenseValues
  hasChanges: boolean
  hpTooltip: string
  hpValue: number
  levelBonusLabel: string
  levelBonusValue: number
  normalizedAttributes: CharacterAttributes
  skillBonusesWithFeats: CharacterSkillBonuses
  skillModifiers: SkillModifierMap
  speedTooltip: string
  speedValue: number
  surgeValue: number
}

export type CharacterHistoryEntryFieldName = Exclude<keyof CharacterHistoryEntry, 'id'>
