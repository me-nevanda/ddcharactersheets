import { useCallback } from 'react'
import type { NpcData, NpcDefenses, NpcRole, NpcSuggestedStats, NpcType } from '@appTypes/npc'

interface NpcRoleAttributeRules {
  hpBase: number
  hpPerLevel: number
  kpBase: number
  otherDefenseBase: number
  attackVsKpBase: number
  attackVsOtherDefensesBase: number
}

type GeneratedNpcAttributes = Pick<NpcData, 'defenses' | 'hp'> & {
  suggested: Omit<NpcSuggestedStats, 'customDamage'>
}

const roleRules: Record<NpcRole, NpcRoleAttributeRules> = {
  skirmisher: {
    hpBase: 21,
    hpPerLevel: 8,
    kpBase: 14,
    otherDefenseBase: 12,
    attackVsKpBase: 5,
    attackVsOtherDefensesBase: 3,
  },
  brute: {
    hpBase: 23,
    hpPerLevel: 10,
    kpBase: 12,
    otherDefenseBase: 12,
    attackVsKpBase: 3,
    attackVsOtherDefensesBase: 1,
  },
  soldier: {
    hpBase: 21,
    hpPerLevel: 8,
    kpBase: 16,
    otherDefenseBase: 12,
    attackVsKpBase: 7,
    attackVsOtherDefensesBase: 5,
  },
  lurker: {
    hpBase: 19,
    hpPerLevel: 6,
    kpBase: 14,
    otherDefenseBase: 12,
    attackVsKpBase: 5,
    attackVsOtherDefensesBase: 3,
  },
  controller: {
    hpBase: 21,
    hpPerLevel: 8,
    kpBase: 14,
    otherDefenseBase: 12,
    attackVsKpBase: 5,
    attackVsOtherDefensesBase: 4,
  },
  artillery: {
    hpBase: 19,
    hpPerLevel: 6,
    kpBase: 12,
    otherDefenseBase: 12,
    attackVsKpBase: 7,
    attackVsOtherDefensesBase: 5,
  },
}

const damageByLevel: Array<{ levels: readonly number[]; lowDamage: string; mediumDamage: string; highDamage: string }> = [
  { levels: [1, 2, 3], lowDamage: '1k6 + 3', mediumDamage: '1k10 + 3', highDamage: '2k6 + 3' },
  { levels: [4, 5, 6], lowDamage: '1k6 + 4', mediumDamage: '1k10 + 4', highDamage: '2k8 + 4' },
  { levels: [7, 8, 9], lowDamage: '1k8 + 5', mediumDamage: '2k6 + 5', highDamage: '2k8 + 5' },
  { levels: [10, 11, 12], lowDamage: '1k8 + 5', mediumDamage: '1k6 + 5', highDamage: '3k6 + 5' },
  { levels: [13, 14, 15], lowDamage: '1k10 + 6', mediumDamage: '2k8 + 6', highDamage: '3k6 + 6' },
  { levels: [16, 17, 18], lowDamage: '1k10 + 7', mediumDamage: '2k8 + 7', highDamage: '3k8 + 7' },
  { levels: [19, 20, 21], lowDamage: '2k6 + 7', mediumDamage: '3k6 + 7', highDamage: '3k8 + 7' },
  { levels: [22, 23, 24], lowDamage: '2k6 + 8', mediumDamage: '3k6 + 8', highDamage: '4k6 + 8' },
  { levels: [25, 26, 27], lowDamage: '2k8 + 9', mediumDamage: '3k8 + 9', highDamage: '4k6 + 9' },
  { levels: [28, 29, 30], lowDamage: '2k8 + 10', mediumDamage: '3k8 + 10', highDamage: '4k8 + 10' },
]

const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof NpcDefenses)[]

const normalizeLevel = (level: number): number => {
  return Math.min(30, Math.max(1, Math.trunc(level)))
}

const randomOffset = (): number => {
  return Math.floor(Math.random() * 3) - 1
}

const pickBoostedDefenseFields = (): Set<keyof NpcDefenses> => {
  const shuffledFields = [...defenseFields].sort(() => Math.random() - 0.5)

  return new Set(shuffledFields.slice(0, 3))
}

const formatSuggestedAttack = (value: number): string => {
  return String(value)
}

const getDamageForLevel = (level: number) => {
  return damageByLevel.find((entry) => entry.levels.includes(level)) ?? damageByLevel[0]
}

const buildRoleHp = (level: number, rules: NpcRoleAttributeRules): number => {
  return rules.hpBase + Math.floor(level / 2) + level * rules.hpPerLevel
}

const buildSoloHp = (level: number): number => {
  const baseHp = 8 * (level + 1) + 13 * Math.floor(level / 2)

  return baseHp * (level <= 10 ? 4 : 5)
}

const boostRandomDefenses = (defenses: NpcDefenses): NpcDefenses => {
  const boostedFields = pickBoostedDefenseFields()

  return defenseFields.reduce<NpcDefenses>((nextDefenses, fieldName) => ({
    ...nextDefenses,
    [fieldName]: nextDefenses[fieldName] + (boostedFields.has(fieldName) ? 2 : 0),
  }), defenses)
}

export const useNpcAttributeGeneration = () => {
  const generateNpcAttributes = useCallback((level: number, role: NpcRole, type: NpcType): GeneratedNpcAttributes => {
    const normalizedLevel = normalizeLevel(level)
    const rules = roleRules[role]
    const damage = getDamageForLevel(normalizedLevel)
    const roleHp = buildRoleHp(normalizedLevel, rules)
    const typeAdjustedHp = type === 'solo' ? buildSoloHp(normalizedLevel) : type === 'elite' ? roleHp * 2 : roleHp
    const baseDefenses = {
      kp: normalizedLevel + rules.kpBase + randomOffset(),
      fortitude: normalizedLevel + rules.otherDefenseBase + randomOffset(),
      reflex: normalizedLevel + rules.otherDefenseBase + randomOffset(),
      will: normalizedLevel + rules.otherDefenseBase + randomOffset(),
    }
    const defenses = type === 'solo' || type === 'elite' ? boostRandomDefenses(baseDefenses) : baseDefenses

    return {
      defenses,
      hp: typeAdjustedHp,
      suggested: {
        attackVsKp: formatSuggestedAttack(normalizedLevel + rules.attackVsKpBase + randomOffset()),
        attackVsOtherDefenses: formatSuggestedAttack(normalizedLevel + rules.attackVsOtherDefensesBase + randomOffset()),
        lowDamage: damage.lowDamage,
        mediumDamage: damage.mediumDamage,
        highDamage: damage.highDamage,
      },
    }
  }, [])

  return {
    generateNpcAttributes,
  }
}
