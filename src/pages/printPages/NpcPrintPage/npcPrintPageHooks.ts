import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getNpc } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Npc, NpcAttackAreaType, NpcDefenses } from '@appTypes/npc'
import type { NpcPrintAreaOption, NpcPrintAttackRow, NpcPrintPageState } from './types'

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
    }
  }, [error, loading, npc, t])
}
