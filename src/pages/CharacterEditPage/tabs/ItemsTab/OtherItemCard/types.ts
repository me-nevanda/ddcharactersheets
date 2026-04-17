import type {
  CharacterItemBonusFieldName,
  CharacterOtherItem,
} from '../../../../../types/character'

export interface OtherItemCardProps {
  item: CharacterOtherItem
  index: number
  onNameChange: (index: number, value: string) => void
  onDescriptionChange: (index: number, value: string) => void
  onRemove: (index: number, name: string) => void
  onEquipChange: (index: number, value: boolean) => void
  onBonusChange: (index: number, fieldName: CharacterItemBonusFieldName, value: number) => void
  onBonusFieldChange: (
    index: number,
    previousFieldName: CharacterItemBonusFieldName,
    nextFieldName: CharacterItemBonusFieldName,
  ) => void
}
