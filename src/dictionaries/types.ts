import type { CharacterAttributes, CharacterTraining } from '../types/character'

export type CharacterAttributeFieldName = keyof CharacterAttributes
export type CharacterTrainingFieldName = keyof CharacterTraining

export interface AttributeDefinition {
  key: CharacterAttributeFieldName
  translationKey: string
}

export interface SkillDefinition {
  key: CharacterTrainingFieldName
  attributeKey: CharacterAttributeFieldName
  translationKey: string
}
