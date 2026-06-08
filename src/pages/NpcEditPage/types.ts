import type { ChangeEvent, SubmitEvent } from 'react'
import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { NpcAttack, NpcAttackType, NpcData, NpcHistoryEntry } from '@appTypes/npc'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'

export type NpcEditTabKey = 'general' | 'attacks' | 'loot' | 'history'

export interface NpcEditPageState {
  error: string
  form: NpcData
  handleAttackAdd: (type: NpcAttackType) => void
  handleAttackChange: (index: number, fieldName: keyof NpcAttack, value: string | number | boolean) => void
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
  handleHistoryEntryChange: (index: number, fieldName: keyof NpcHistoryEntry, value: string) => void
  handleHistoryEntryCreateEmpty: () => void
  handleHistoryEntryRemove: (index: number) => void
  handlePrint: () => void
  handleResistancesChange: (value: string) => void
  handleSpecialChange: (value: string) => void
  handleIsStoryToggle: (event: ChangeEvent<HTMLInputElement>) => void
  handleIsDeadToggle: (event: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  hasChanges: boolean
  imageUrl: string
  isGenerateAttributesDialogOpen: boolean
  loading: boolean
  saving: boolean
  removingImage: boolean
  uploadingImage: boolean
}
