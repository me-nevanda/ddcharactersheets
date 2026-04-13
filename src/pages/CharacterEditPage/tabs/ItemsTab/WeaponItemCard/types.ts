import type {
  CharacterWeapon,
  CharacterWeaponFieldName,
  CharacterWeaponDamageDiceType,
} from '../../../../../types/character'

export interface WeaponItemCardProps {
  weapon: CharacterWeapon
  index: number
  onNameChange: (index: number, value: string) => void
  onDescriptionChange: (index: number, value: string) => void
  onRemove: (index: number, name: string) => void
  onDamageChange: (
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) => void
}
