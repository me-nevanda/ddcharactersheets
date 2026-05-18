import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterItems, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'

export interface LootTabProps {
  items: CharacterItems
  onItemCreateEmpty: (group: CharacterItemGroupKey) => void
  onItemChange: (
    group: CharacterItemGroupKey,
    index: number,
    fieldName: CharacterItemFieldName | CharacterItemBonusFieldName,
    value: string | number | boolean,
  ) => void
  onItemBonusFieldChange: (
    group: CharacterItemGroupKey,
    index: number,
    previousFieldName: CharacterArmorBonusFieldName,
    nextFieldName: CharacterArmorBonusFieldName,
  ) => void
  onArmorBonusChange: (index: number, fieldName: CharacterArmorBonusFieldName, value: number) => void
  onWeaponDamageChange: (
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) => void
  onItemRemove: (group: CharacterItemGroupKey, index: number) => void
}

export interface PendingLootRemoval {
  group: CharacterItemGroupKey
  index: number
  name: string
}
