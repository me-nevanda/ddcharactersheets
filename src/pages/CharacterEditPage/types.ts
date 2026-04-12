import type { ChangeEvent, FormEvent } from 'react'
import type {
  CharacterAttributes,
  CharacterData,
  CharacterDefenses,
  CharacterTraining,
} from '../../types/character'

export interface CharacterEditFormData extends CharacterData {}

export type CharacterGeneralFieldName = 'name' | 'level' | 'speed' | 'race' | 'class'

export type CharacterAttributeFieldName = keyof CharacterAttributes

export type CharacterDefenseFieldName = keyof CharacterDefenses

export type CharacterTrainingFieldName = keyof CharacterTraining

export type CharacterGeneralChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>

export interface AttributeRow {
  key: CharacterAttributeFieldName
  value: number
  modifierLabel: string
}

export type SkillModifierMap = Record<CharacterTrainingFieldName, string>

export interface CharacterEditPageState {
  error: string
  form: CharacterEditFormData
  loading: boolean
  saving: boolean
  handleGeneralChange: (event: CharacterGeneralChangeEvent) => void
  handleAttributeChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleTrainingChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  attributeRows: AttributeRow[]
  skillModifiers: SkillModifierMap
  levelBonusLabel: string
  defenseValues: DefenseValues
}

export interface GeneralSectionProps {
  form: CharacterEditFormData
  levelBonusLabel: string
  onChange: (event: CharacterGeneralChangeEvent) => void
}

export interface AttributesSectionProps {
  attributeRows: AttributeRow[]
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export interface TrainingSectionProps {
  training: CharacterTraining
  skillModifiers: SkillModifierMap
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export interface DefensesSectionProps {
  defenseValues: DefenseValues
}

export interface DefenseValues {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface AttributeDefinition {
  key: CharacterAttributeFieldName
  translationKey: string
}

export interface SkillDefinition {
  key: CharacterTrainingFieldName
  attributeKey: CharacterAttributeFieldName
  translationKey: string
}
