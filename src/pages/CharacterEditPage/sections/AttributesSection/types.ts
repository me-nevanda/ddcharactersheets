import type { CharacterAttributeFieldName } from '../../types'

export interface AttributeRow {
  key: CharacterAttributeFieldName
  value: number
  modifierLabel: string
}

export interface AttributeCardViewModel {
  bonusLabel: string
  bonusTooltip: string
  inputId: CharacterAttributeFieldName
  label: string
  modifierLabel: string
  value: number
}
