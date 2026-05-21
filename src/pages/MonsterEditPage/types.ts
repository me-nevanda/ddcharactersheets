import type { ChangeEvent, FormEvent } from 'react'
import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { MonsterAttack, MonsterAttackType, MonsterData } from '@appTypes/monster'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'

export type MonsterEditTabKey = 'general' | 'attacks' | 'loot'

export interface MonsterEditPageState {
  error: string
  form: MonsterData
  handleAttackAdd: (type: MonsterAttackType) => void
  handleAttackChange: (index: number, fieldName: keyof MonsterAttack, value: string | number) => void
  handleAttackRemove: (index: number) => void
  handleCancelGenerateAttributes: () => void
  handleConfirmGenerateAttributes: () => void
  handleItemCreateEmpty: (group: CharacterItemGroupKey) => void
  handleItemChange: (
    group: CharacterItemGroupKey,
    index: number,
    fieldName: CharacterItemFieldName | CharacterItemBonusFieldName,
    value: string | number | boolean,
  ) => void
  handleItemBonusFieldChange: (
    group: CharacterItemGroupKey,
    index: number,
    previousFieldName: CharacterArmorBonusFieldName,
    nextFieldName: CharacterArmorBonusFieldName,
  ) => void
  handleArmorBonusChange: (index: number, fieldName: CharacterArmorBonusFieldName, value: number) => void
  handleWeaponDamageChange: (
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) => void
  handleItemRemove: (group: CharacterItemGroupKey, index: number) => void
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleDescriptionChange: (value: string) => void
  handleGenerateAttributes: () => void
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleImageRemove: () => Promise<void>
  handlePrint: () => void
  handleResistancesChange: (value: string) => void
  handleSpecialChange: (value: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  imageUrl: string
  isGenerateAttributesDialogOpen: boolean
  loading: boolean
  saving: boolean
  removingImage: boolean
  uploadingImage: boolean
}
