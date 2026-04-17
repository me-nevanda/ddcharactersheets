import { useState } from 'react'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import {
  buildAttributeModifierMap,
  buildEffectiveAttributes,
  buildNormalizedAttributes,
} from '../../sections/AttributesSection/attributesSectionLogic'
import { formatModifier, getLevelBonus } from '../../sections/GeneralSection/generalSectionLogic'
import styles from '../../style.module.scss'
import type {
  PendingAbilityRemoval,
  SelectOption,
  VisibleAbilityEntry,
} from './types'
import type {
  CharacterAttributes,
  CharacterDefenses,
  CharacterAbilityAreaType,
  CharacterWeaponDamageType,
  CharacterAbilityType,
} from '../../../../types/character'

export function useAbilitiesTab() {
  const { t } = useI18n()
  const { form, handleAbilityCreateEmpty, handleAbilityChange, handleAbilityRemove } =
    useCharacterEditPageContext()
  const [activeType, setActiveType] = useState<CharacterAbilityType>('unlimited')
  const [pendingRemoval, setPendingRemoval] = useState<PendingAbilityRemoval | null>(null)

  const normalizedAttributes = buildNormalizedAttributes(form.attributes)
  const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, form.attributesPlus)
  const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes)
  const levelBonusValue = getLevelBonus(form.level)

  const weaponOptions = form.items.weapons
    .map((weapon) => weapon.name.trim())
    .filter((weaponName, index, array) => weaponName.length > 0 && array.indexOf(weaponName) === index)

  const attributeOptions: SelectOption<keyof CharacterAttributes>[] = [
    {
      value: 'strength',
      label: `${t('pages.characterEdit.fields.strength')} (${formatModifier(attributeModifierMap.strength + levelBonusValue)})`,
    },
    {
      value: 'condition',
      label: `${t('pages.characterEdit.fields.condition')} (${formatModifier(attributeModifierMap.condition + levelBonusValue)})`,
    },
    {
      value: 'dexterity',
      label: `${t('pages.characterEdit.fields.dexterity')} (${formatModifier(attributeModifierMap.dexterity + levelBonusValue)})`,
    },
    {
      value: 'intelligence',
      label: `${t('pages.characterEdit.fields.intelligence')} (${formatModifier(attributeModifierMap.intelligence + levelBonusValue)})`,
    },
    {
      value: 'wisdom',
      label: `${t('pages.characterEdit.fields.wisdom')} (${formatModifier(attributeModifierMap.wisdom + levelBonusValue)})`,
    },
    {
      value: 'charisma',
      label: `${t('pages.characterEdit.fields.charisma')} (${formatModifier(attributeModifierMap.charisma + levelBonusValue)})`,
    },
  ]

  const defenseOptions: SelectOption<keyof CharacterDefenses>[] = [
    { value: 'kp', label: t('pages.characterEdit.fields.kp') },
    { value: 'fortitude', label: t('pages.characterEdit.fields.fortitude') },
    { value: 'reflex', label: t('pages.characterEdit.fields.reflex') },
    { value: 'will', label: t('pages.characterEdit.fields.will') },
  ]

  const attackBonusOptions = Array.from({ length: 16 }, (_, bonus) => bonus - 5)

  const weaponDamageTypeOptions: SelectOption<CharacterWeaponDamageType>[] = [
    { value: 'normal', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.normal') },
    { value: 'acid', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.acid') },
    { value: 'cold', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.cold') },
    { value: 'fire', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.fire') },
    { value: 'force', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.force') },
    { value: 'lightning', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.lightning') },
    { value: 'necrotic', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.necrotic') },
    { value: 'poison', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.poison') },
    { value: 'psychic', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.psychic') },
    { value: 'radiant', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.radiant') },
    { value: 'thunder', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.thunder') },
  ]

  const weaponAreaOptions: SelectOption<CharacterAbilityAreaType>[] = [
    { value: 'point', label: t('pages.characterEdit.abilities.weaponAreaOptions.point') },
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `burst${count}` as CharacterAbilityAreaType,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.burst')} ${count}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `blast${count}` as CharacterAbilityAreaType,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.blast')} ${count}`,
    })),
  ]

  const visibleAbilities: VisibleAbilityEntry[] = form.abilities
    .map((ability, index) => ({ ability, index }))
    .filter(({ ability }) => ability.type === activeType)

  function handleAddAbility() {
    handleAbilityCreateEmpty(activeType)
  }

  function handleRemoveAbility(index: number, abilityName: string) {
    setPendingRemoval({
      index,
      name: abilityName || t('pages.characterEdit.abilities.title'),
    })
  }

  function handleConfirmRemoveAbility() {
    if (!pendingRemoval) {
      return
    }

    handleAbilityRemove(pendingRemoval.index)
    setPendingRemoval(null)
  }

  function handleCancelRemoveAbility() {
    setPendingRemoval(null)
  }

  function getAbilityHeaderClass(type: CharacterAbilityType) {
    if (type === 'standard') {
      return styles.abilityHeaderStandard
    }

    if (type === 'encounter') {
      return styles.abilityHeaderEncounter
    }

    if (type === 'daily') {
      return styles.abilityHeaderDaily
    }

    return styles.abilityHeaderUnlimited
  }

  return {
    t,
    form,
    activeType,
    weaponOptions,
    attributeOptions,
    defenseOptions,
    attackBonusOptions,
    weaponDamageTypeOptions,
    weaponAreaOptions,
    visibleAbilities,
    pendingRemoval,
    setActiveType,
    handleAbilityChange,
    handleAddAbility,
    handleRemoveAbility,
    handleConfirmRemoveAbility,
    handleCancelRemoveAbility,
    getAbilityHeaderClass,
  }
}
