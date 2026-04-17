import type {
  CharacterArmorBonusFieldName,
  CharacterItemBonusFieldName,
  CharacterWeaponBonusFieldName,
} from '../../../../types/character'

export interface ItemBonusFieldOption<TFieldName extends string> {
  fieldName: TFieldName
  labelKey: string
}

export const itemBonusValueOptions = Array.from({ length: 16 }, (_, bonus) => bonus - 5)

export const commonItemBonusFields: ItemBonusFieldOption<CharacterItemBonusFieldName>[] = [
  { fieldName: 'strengthBonusNumber', labelKey: 'pages.characterEdit.fields.strength' },
  { fieldName: 'conditionBonusNumber', labelKey: 'pages.characterEdit.fields.condition' },
  { fieldName: 'dexterityBonusNumber', labelKey: 'pages.characterEdit.fields.dexterity' },
  { fieldName: 'intelligenceBonusNumber', labelKey: 'pages.characterEdit.fields.intelligence' },
  { fieldName: 'wisdomBonusNumber', labelKey: 'pages.characterEdit.fields.wisdom' },
  { fieldName: 'charismaBonusNumber', labelKey: 'pages.characterEdit.fields.charisma' },
  { fieldName: 'speedBonusNumber', labelKey: 'pages.characterEdit.fields.speed' },
  { fieldName: 'kpBonusNumber', labelKey: 'pages.characterEdit.fields.kp' },
  { fieldName: 'fortitudeBonusNumber', labelKey: 'pages.characterEdit.fields.fortitude' },
  { fieldName: 'reflexBonusNumber', labelKey: 'pages.characterEdit.fields.reflex' },
  { fieldName: 'willBonusNumber', labelKey: 'pages.characterEdit.fields.will' },
]

export const weaponBonusFields: ItemBonusFieldOption<CharacterWeaponBonusFieldName>[] = commonItemBonusFields

export const otherBonusFields: ItemBonusFieldOption<CharacterItemBonusFieldName>[] = commonItemBonusFields

export const armorBonusFields: ItemBonusFieldOption<CharacterArmorBonusFieldName>[] = [
  ...commonItemBonusFields,
  { fieldName: 'armorPenaltyNumber', labelKey: 'pages.characterEdit.fields.armorPenalty' },
]
