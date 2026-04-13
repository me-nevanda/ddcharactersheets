import type {
  CharacterArmor,
  CharacterItemBonusFieldName,
} from '../../../../../types/character'

export interface ArmorItemCardProps {
  armor: CharacterArmor
  index: number
  onNameChange: (index: number, value: string) => void
  onDescriptionChange: (index: number, value: string) => void
  onRemove: (index: number, name: string) => void
  onEquipChange: (index: number, value: boolean) => void
  onBonusChange: (index: number, fieldName: CharacterItemBonusFieldName, value: number) => void
}
