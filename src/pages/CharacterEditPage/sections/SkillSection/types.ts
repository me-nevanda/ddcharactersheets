import type { CharacterSkillFieldName } from '../../types'

export interface SkillCardViewModel {
  checked: boolean
  disabled: boolean
  highlighted: boolean
  key: CharacterSkillFieldName
  label: string
  modifierLabel: string
  tooltip: string
}
