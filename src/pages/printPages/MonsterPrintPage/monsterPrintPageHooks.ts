import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMonster } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Monster, MonsterAttackAreaType, MonsterDefenses } from '@appTypes/monster'
import type { MonsterPrintAreaOption, MonsterPrintAttackRow, MonsterPrintItemRow, MonsterPrintPageState, PrintMonsterItemCategory } from './types'

const buildItemRows = (
  items: Array<{ id: string; name: string; description: string }>,
  category: PrintMonsterItemCategory,
): MonsterPrintItemRow[] => {
  return items
    .filter((item) => item.name.trim().length > 0 || item.description.trim().length > 0)
    .map((item, index) => ({
      key: item.id || `${item.name.trim() || 'item'}-${index}`,
      name: item.name,
      description: item.description,
      category,
    }))
}

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

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const applySuggestedDamageToDescription = (description: string, monster: Monster): string => {
  return description
    .replace(/\[S\]/g, escapeHtml(monster.suggested.lowDamage))
    .replace(/\[M\]/g, escapeHtml(monster.suggested.mediumDamage))
    .replace(/\[L\]/g, escapeHtml(monster.suggested.highDamage))
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
      description: applySuggestedDamageToDescription(attack.description, monster),
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
        weapons: [],
        armors: [],
        others: [],
        hasItems: false,
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

    const weapons = buildItemRows(monster.items.weapons, 'weapon')
    const armors = buildItemRows(monster.items.armors, 'armor')
    const others = buildItemRows(monster.items.others, 'other')

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
      weapons,
      armors,
      others,
      hasItems: weapons.length > 0 || armors.length > 0 || others.length > 0,
    }
  }, [error, loading, monster, t])
}
