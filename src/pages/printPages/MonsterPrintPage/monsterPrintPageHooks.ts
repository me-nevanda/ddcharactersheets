import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMonster } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Monster, MonsterAttackAreaType, MonsterDefenses } from '@appTypes/monster'
import type { MonsterPrintAreaOption, MonsterPrintAttackRow, MonsterPrintPageState } from './types'

const buildAreaOptions = (t: ReturnType<typeof useI18n>['t']): MonsterPrintAreaOption[] => {
  return [
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
}

const buildAttackRows = (t: ReturnType<typeof useI18n>['t'], monster: Monster): MonsterPrintAttackRow[] => {
  const areaOptions = buildAreaOptions(t)

  return monster.attacks.map((attack, index) => {
    const defenseLabel = t(`pages.monsterEdit.fields.${attack.attackDefense}`)
    const areaLabel = areaOptions.find((option) => option.value === attack.area)?.label ?? ''
    const meta = [
      t(`pages.characterEdit.abilities.actionOptions.${attack.action}`),
      attack.range > 0 ? `${t('pages.characterEdit.abilities.weaponRangeLabel')}: ${attack.range}` : '',
      areaLabel,
    ].filter(Boolean)

    return {
      ...attack,
      key: attack.id || `${attack.name}-${index}`,
      meta,
      areaLabel,
      attackDisplay: `+${attack.attackBonusNumber} ${t('pages.characterEdit.abilities.weaponAgainstLabel')} ${defenseLabel}`,
    }
  })
}

export const useMonsterPrintPage = (): MonsterPrintPageState => {
  const { t } = useI18n()
  const { monsterId = '' } = useParams()
  const [monster, setMonster] = useState<Monster | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadMonster = async () => {
      try {
        const nextMonster = await getMonster(monsterId)

        if (!cancelled) {
          setMonster(nextMonster)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadMonster()

    return () => {
      cancelled = true
    }
  }, [monsterId, t])

  useEffect(() => {
    document.title = monster?.name ? `${t('pages.monsterPrint.title')} - ${monster.name}` : t('pages.monsterPrint.title')
  }, [monster?.name, t])

  return useMemo<MonsterPrintPageState>(() => {
    const title = t('pages.monsterPrint.title')
    const monsterName = monster?.name.trim() || t('pages.monsterList.unnamedMonster')

    if (!monster) {
      return {
        monster,
        loading,
        error,
        title,
        monsterName,
        bloodiedValue: 0,
        statRows: [],
        defenseRows: [],
        attackRows: [],
      }
    }

    const statRows = [
      { label: t('pages.monsterEdit.fields.level'), value: String(monster.level) },
      { label: t('pages.monsterEdit.fields.speed'), value: String(monster.speed) },
      { label: t('pages.monsterEdit.fields.hp'), value: String(monster.hp) },
      { label: t('pages.monsterEdit.fields.bloodied'), value: String(Math.floor(monster.hp / 2)) },
    ]
    const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof MonsterDefenses)[]
    const defenseRows = defenseFields.map((fieldName) => ({
      label: t(`pages.monsterEdit.fields.${fieldName}`),
      value: String(monster.defenses[fieldName]),
    }))

    return {
      monster,
      loading,
      error,
      title,
      monsterName,
      bloodiedValue: Math.floor(monster.hp / 2),
      statRows,
      defenseRows,
      attackRows: buildAttackRows(t, monster),
    }
  }, [error, loading, monster, t])
}
