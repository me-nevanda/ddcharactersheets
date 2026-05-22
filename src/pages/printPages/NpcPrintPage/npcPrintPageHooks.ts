import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getNpc } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Npc, NpcAttackAreaType, NpcDefenses } from '@appTypes/npc'
import type { NpcPrintAreaOption, NpcPrintAttackRow, NpcPrintItemRow, NpcPrintPageState, PrintNpcItemCategory } from './types'

const buildItemRows = (
  items: Array<{ id: string; name: string; description: string }>,
  category: PrintNpcItemCategory,
): NpcPrintItemRow[] => {
  return items
    .filter((item) => item.name.trim().length > 0 || item.description.trim().length > 0)
    .map((item, index) => ({
      key: item.id || `${item.name.trim() || 'item'}-${index}`,
      name: item.name,
      description: item.description,
      category,
    }))
}

const buildAreaOptions = (t: ReturnType<typeof useI18n>['t']): NpcPrintAreaOption[] => {
  return [
    { value: 'point', label: t('pages.characterEdit.abilities.weaponAreaOptions.point') },
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `burst${count}` as NpcAttackAreaType,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.burst')} ${count}`,
    })),
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `blast${count}` as NpcAttackAreaType,
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

const applySuggestedDamageToDescription = (description: string, npc: Npc): string => {
  return description
    .replace(/\[S\]/g, escapeHtml(npc.suggested.lowDamage))
    .replace(/\[M\]/g, escapeHtml(npc.suggested.mediumDamage))
    .replace(/\[L\]/g, escapeHtml(npc.suggested.highDamage))
}

const buildAttackRows = (t: ReturnType<typeof useI18n>['t'], npc: Npc): NpcPrintAttackRow[] => {
  const areaOptions = buildAreaOptions(t)

  return npc.attacks.map((attack, index) => {
    const defenseLabel = t(`pages.npcEdit.fields.${attack.attackDefense}`)
    const areaLabel = areaOptions.find((option) => option.value === attack.area)?.label ?? ''
    const meta = [
      t(`pages.characterEdit.abilities.actionOptions.${attack.action}`),
      attack.range > 0 ? `${t('pages.characterEdit.abilities.weaponRangeLabel')}: ${attack.range}` : '',
      areaLabel,
    ].filter(Boolean)

    return {
      ...attack,
      key: attack.id || `${attack.name}-${index}`,
      description: applySuggestedDamageToDescription(attack.description, npc),
      meta,
      areaLabel,
      attackDisplay: `+${attack.attackBonusNumber} ${t('pages.characterEdit.abilities.weaponAgainstLabel')} ${defenseLabel}`,
    }
  })
}

export const useNpcPrintPage = (): NpcPrintPageState => {
  const { t } = useI18n()
  const { npcId = '' } = useParams()
  const [npc, setNpc] = useState<Npc | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadNpc = async () => {
      try {
        const nextNpc = await getNpc(npcId)

        if (!cancelled) {
          setNpc(nextNpc)
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

    void loadNpc()

    return () => {
      cancelled = true
    }
  }, [npcId, t])

  useEffect(() => {
    document.title = npc?.name ? `${t('pages.npcPrint.title')} - ${npc.name}` : t('pages.npcPrint.title')
  }, [npc?.name, t])

  return useMemo<NpcPrintPageState>(() => {
    const title = t('pages.npcPrint.title')
    const npcName = npc?.name.trim() || t('pages.npcList.unnamedNpc')

    if (!npc) {
      return {
        npc,
        loading,
        error,
        title,
        npcName,
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
      { label: t('pages.npcEdit.fields.level'), value: String(npc.level) },
      { label: t('pages.npcEdit.fields.speed'), value: String(npc.speed) },
      { label: t('pages.npcEdit.fields.hp'), value: String(npc.hp) },
      { label: t('pages.npcEdit.fields.bloodied'), value: String(Math.floor(npc.hp / 2)) },
    ]
    const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof NpcDefenses)[]
    const defenseRows = defenseFields.map((fieldName) => ({
      label: t(`pages.npcEdit.fields.${fieldName}`),
      value: String(npc.defenses[fieldName]),
    }))

    const weapons = buildItemRows(npc.items.weapons, 'weapon')
    const armors = buildItemRows(npc.items.armors, 'armor')
    const others = buildItemRows(npc.items.others, 'other')

    return {
      npc,
      loading,
      error,
      title,
      npcName,
      bloodiedValue: Math.floor(npc.hp / 2),
      statRows,
      defenseRows,
      attackRows: buildAttackRows(t, npc),
      weapons,
      armors,
      others,
      hasItems: weapons.length > 0 || armors.length > 0 || others.length > 0,
    }
  }, [error, loading, npc, t])
}
