import type { ItemBonusFieldOption } from '../itemBonusFields'

export interface ItemBonusEditorProps<TFieldName extends string> {
  bonusFields: ItemBonusFieldOption<TFieldName>[]
  idPrefix: string
  getBonusValue: (fieldName: TFieldName) => number
  onBonusFieldChange: (previousFieldName: TFieldName, nextFieldName: TFieldName) => void
  onBonusValueChange: (fieldName: TFieldName, value: number) => void
}
