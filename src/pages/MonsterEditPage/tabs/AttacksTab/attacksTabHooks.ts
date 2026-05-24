import { useState } from 'react'
import { useI18n } from '@i18n/index'
import type { MonsterAttackAreaType, MonsterAttackType, MonsterDefenses } from '@appTypes/monster'
import styles from '../../style.module.scss'
import type { AttacksTabProps, SelectOption, VisibleMonsterAttackEntry } from './types'

export const useAttacksTab = ({ attacks, onAttackAdd, onAttackChange, onAttackRemove }: AttacksTabProps) => {
  const { t } = useI18n()
  const [activeType, setActiveType] = useState<MonsterAttackType>('unlimited')

  const attackTypeTabs = [
    { value: 'unlimited', label: t('pages.monsterEdit.attacks.typeOptions.unlimited') },
    { value: 'encounter', label: t('pages.monsterEdit.attacks.typeOptions.encounter') },
  ] as const

  const areaOptions: SelectOption<MonsterAttackAreaType>[] = [
    { value: 'point', label: t('pages.characterEdit.abilities.weaponAreaOptions.point') },
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `burst${count}` as MonsterAttackAreaType,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.burst')} ${count}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `blast${count}` as MonsterAttackAreaType,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.blast')} ${count}`,
    })),
  ]
  const attackBonusOptions = Array.from({ length: 36 }, (_, bonus) => bonus)
  const defenseOptions: SelectOption<keyof MonsterDefenses>[] = [
    { value: 'kp', label: t('pages.monsterEdit.fields.kp') },
    { value: 'fortitude', label: t('pages.monsterEdit.fields.fortitude') },
    { value: 'reflex', label: t('pages.monsterEdit.fields.reflex') },
    { value: 'will', label: t('pages.monsterEdit.fields.will') },
  ]

  const visibleAttacks: VisibleMonsterAttackEntry[] = attacks
    .map((attack, index) => ({ attack, index }))
    .filter(({ attack }) => attack.type === activeType)

  const handleAddAttack = () => {
    onAttackAdd(activeType)
  }

  const getAttackHeaderClass = (type: MonsterAttackType) => {
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
    activeType,
    attackBonusOptions,
    areaOptions,
    attackTypeTabs,
    defenseOptions,
    getAttackHeaderClass,
    handleAddAttack,
    onAttackChange,
    onAttackRemove,
    setActiveType,
    t,
    visibleAttacks,
  }
}
