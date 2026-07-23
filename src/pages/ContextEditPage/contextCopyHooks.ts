import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useI18n } from '@i18n/index'
import { getCharacterHistory } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { Area, PlaceItem } from '@appTypes/area'
import type { Character, CharacterAbility, CharacterAbilityAreaType, CharacterDefenses, CharacterHistoryEntry } from '@appTypes/character'
import type { ContextAreaSnapshot, ContextCharacterGroupSnapshot, ContextData, ContextMonsterGroupSnapshot, ContextNpcGroupSnapshot } from '@appTypes/context'
import type { Event } from '@appTypes/event'
import type { MapData as AppMapData, MapElementCategory, MapElementVariant, MapGroundTexture } from '@appTypes/map'
import type { Monster, MonsterAttack, MonsterAttackAreaType } from '@appTypes/monster'
import type { Npc, NpcAttack, NpcAttackAreaType } from '@appTypes/npc'
import type { ContextCopyState, UseContextCopyParams } from './types'

const stripHtml = (value: string): string => {
  if (!value) {
    return ''
  }
  if (typeof document === 'undefined') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const template = document.createElement('template')
  template.innerHTML = value
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
}

const normalizeText = (value: string | number | undefined | null): string => {
  if (typeof value === 'number') {
    return String(value)
  }
  return stripHtml(value ?? '')
}

export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  throw new Error('errors.api.generic')
}

const createMapById = <T extends { id: string }>(items: T[]): Map<string, T> => {
  const map = new Map<string, T>()
  for (const item of items) {
    map.set(item.id, item)
  }
  return map
}

interface BuildContextCopyTextParams {
  areasById: Map<string, Area>
  characterHistoryById: Map<string, CharacterHistoryEntry[]>
  charactersById: Map<string, Character>
  eventsById: Map<string, Event>
  form: ContextData
  getCharacterClassLabel: (value: Character['class']) => string
  getCharacterRaceLabel: (value: Character['race']) => string
  getMonsterRoleLabel: (monster: Monster) => string
  getMonsterTypeLabel: (monster: Monster) => string
  monstersById: Map<string, Monster>
  npcsById: Map<string, Npc>
  t: (key: string, variables?: Record<string, string | number>) => string
}

interface BuildSingleCharacterContextCopyTextOptions {
  defenseValues?: CharacterDefenses
  hpValue?: number
  includeAbilities?: boolean
}

interface ContextHistoryEntry {
  title: string
  content: string
}

interface BuildSingleMonsterContextCopyTextOptions {
  includeAttacks?: boolean
}

interface BuildSingleNpcContextCopyTextOptions {
  includeAttacks?: boolean
}

const appendBlock = (lines: string[], title: string, blockLines: string[]) => {
  if (blockLines.length === 0) {
    return
  }
  if (lines.length > 0) {
    lines.push('')
  }
  lines.push(title, ...blockLines)
}

const buildHistoryEntryLine = (entry: ContextHistoryEntry): string => {
  const title = normalizeText(entry.title)
  const content = normalizeText(entry.content)

  if (title && content) {
    return `- ${title} - ${content}`
  }

  return `- ${title || content}`
}

const buildCharacterHistoryLines = (
  characterName: string,
  entries: ContextHistoryEntry[] | undefined,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  const historyLines = (entries ?? [])
    .map(buildHistoryEntryLine)
    .filter((line) => line.length > 2)

  if (historyLines.length === 0) {
    return []
  }

  return [
    t('pages.contextEdit.copy.characterHistoryTitle', { name: characterName }),
    ...historyLines,
  ]
}

const buildCharacterGroupLines = (
  groups: ContextCharacterGroupSnapshot[],
  charactersById: Map<string, Character>,
  characterHistoryById: Map<string, CharacterHistoryEntry[]>,
  getCharacterRaceLabel: (value: Character['race']) => string,
  getCharacterClassLabel: (value: Character['class']) => string,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return groups.flatMap((group) => {
    const characterBlocks = group.characterIds.map((characterId) => {
      const character = charactersById.get(characterId)
      if (!character) {
        return []
      }
      const characterName = normalizeText(character.name)
      return [
        `- ${[
          characterName,
          `${normalizeText(character.level)} ${getCharacterRaceLabel(character.race)}`,
          getCharacterClassLabel(character.class),
          normalizeText(character.shortDescription),
        ].join(' | ')}`,
        ...buildCharacterHistoryLines(characterName, characterHistoryById.get(characterId), t),
      ]
    }).filter((block) => block.length > 0)
    if (characterBlocks.length === 0) {
      return []
    }
    return [normalizeText(group.name), ...characterBlocks.flatMap((block, index) => (index === 0 ? block : ['', ...block]))]
  })
}

export const buildSingleCharacterContextCopyText = (
  character: Pick<Character, 'abilities' | 'class' | 'defenses' | 'hp' | 'level' | 'name' | 'race' | 'shortDescription'>,
  historyEntries: ContextHistoryEntry[],
  getCharacterRaceLabel: (value: Character['race']) => string,
  getCharacterClassLabel: (value: Character['class']) => string,
  t: (key: string, variables?: Record<string, string | number>) => string,
  options: BuildSingleCharacterContextCopyTextOptions = {},
): string => {
  const characterName = normalizeText(character.name)
  const lines = [
    t('pages.contextEdit.copy.singleCharacterIntro', { name: characterName }),
    '',
    `- ${[
      characterName,
      `${normalizeText(character.level)} ${getCharacterRaceLabel(character.race)}`,
      getCharacterClassLabel(character.class),
      normalizeText(character.shortDescription),
    ].join(' | ')}`,
    ...buildCharacterHistoryLines(characterName, historyEntries, t),
  ]

  if (options.includeAbilities) {
    lines.push(
      '',
      ...buildCharacterStatsLines(
        options.hpValue ?? character.hp,
        options.defenseValues ?? character.defenses,
        t,
      ),
      '',
      ...buildCharacterAbilityLines(character.abilities, t),
    )
  }

  return lines.join('\n')
}

const buildCharacterAbilityAreaLabel = (
  area: CharacterAbilityAreaType,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  if (area === 'point') {
    return t('pages.characterEdit.abilities.weaponAreaOptions.point')
  }

  const areaMatch = area.match(/^(burst|blast)(\d+)$/)
  if (!areaMatch) {
    return area
  }

  return `${t(`pages.characterEdit.abilities.weaponAreaOptions.${areaMatch[1]}`)} ${areaMatch[2]}`
}

const buildCharacterStatsLines = (
  hpValue: number,
  defenseValues: CharacterDefenses,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return [
    t('pages.contextEdit.copy.characterStatsTitle'),
    `- ${[
      `${t('pages.characterEdit.fields.hp')} ${normalizeText(hpValue)}`,
      `${t('pages.characterEdit.fields.kp')} ${normalizeText(defenseValues.kp)}`,
      `${t('pages.characterEdit.fields.fortitude')} ${normalizeText(defenseValues.fortitude)}`,
      `${t('pages.characterEdit.fields.reflex')} ${normalizeText(defenseValues.reflex)}`,
      `${t('pages.characterEdit.fields.will')} ${normalizeText(defenseValues.will)}`,
    ].join(' | ')}`,
  ]
}

const buildCharacterAbilityLines = (
  abilities: CharacterAbility[],
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  if (abilities.length === 0) {
    return []
  }

  return [
    t('pages.contextEdit.copy.characterAbilitiesTitle'),
    ...abilities.map((ability) => {
      const abilityName = normalizeText(ability.name) || t('pages.characterEdit.abilities.title')
      const abilityDetails = [
        abilityName,
        t(`pages.characterEdit.abilities.typeOptions.${ability.type}`),
        t(`pages.characterEdit.abilities.kindOptions.${ability.kind}`),
        t(`pages.characterEdit.abilities.actionOptions.${ability.action}`),
        `${t('pages.contextEdit.copy.attackRangeLabel')} ${normalizeText(ability.weaponRange)}`,
        `${t('pages.contextEdit.copy.attackAreaLabel')} ${buildCharacterAbilityAreaLabel(ability.weaponArea, t)}`,
      ]

      if (ability.kind === 'offensive') {
        abilityDetails.push(
          `${t('pages.characterEdit.abilities.attackLabel')}: +${normalizeText(ability.weaponAttackBonusNumber)} ${t('pages.characterEdit.abilities.weaponAgainstLabel')} ${ability.weaponAttackDefense ? t(`pages.characterEdit.fields.${ability.weaponAttackDefense}`) : t('pages.characterEdit.abilities.weaponOptions.none')}`,
        )
      }

      abilityDetails.push(normalizeText(ability.description))

      if (ability.kind === 'offensive') {
        abilityDetails.push(
          `${t('pages.characterEdit.abilities.weaponHitLabel')}: ${normalizeText(ability.weaponHit)}`,
          `${t('pages.characterEdit.abilities.weaponMissLabel')}: ${normalizeText(ability.weaponMiss)}`,
          `${t('pages.characterEdit.abilities.weaponProvocationLabel')}: ${normalizeText(ability.weaponProvocation)}`,
        )
      }

      return `- ${abilityDetails.join(' | ')}`
    }),
  ]
}

export const buildSingleNpcContextCopyText = (
  npc: Pick<Npc, 'attacks' | 'defenses' | 'description' | 'history' | 'hp' | 'isDead' | 'isStory' | 'level' | 'name' | 'suggested'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
  options: BuildSingleNpcContextCopyTextOptions = {},
): string => {
  const npcName = normalizeText(npc.name)
  const parts = [
    npcName,
    normalizeText(npc.description),
  ]

  if (!npc.isStory) {
    parts.push(`${t('pages.contextEdit.copy.levelLabel')} ${normalizeText(npc.level)}`)
  }

  parts.push(npc.isDead ? t('pages.contextEdit.copy.dead') : t('pages.contextEdit.copy.alive'))

  const lines = [
    t('pages.contextEdit.copy.singleNpcIntro', { name: npcName }),
    '',
    `- ${parts.join(' | ')}`,
    ...buildCharacterHistoryLines(npcName, npc.history, t),
  ]

  if (options.includeAttacks && !npc.isStory) {
    lines.push(
      '',
      ...buildNpcStatsLines(npc, t),
      '',
      t('pages.contextEdit.copy.monsterDamageLegendTitle'),
      t('pages.contextEdit.copy.monsterDamageLegend', {
        low: t('pages.npcEdit.fields.low'),
        medium: t('pages.npcEdit.fields.medium'),
        high: t('pages.npcEdit.fields.high'),
        custom: t('pages.npcEdit.fields.custom'),
        lowDamage: normalizeText(npc.suggested.lowDamage),
        mediumDamage: normalizeText(npc.suggested.mediumDamage),
        highDamage: normalizeText(npc.suggested.highDamage),
        customDamage: normalizeText(npc.suggested.customDamage),
      }),
      '',
      ...buildNpcAttackLines(npc.attacks, t),
    )
  }

  return lines.join('\n')
}

const buildNpcAttackAreaLabel = (
  area: NpcAttackAreaType,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  if (area === 'point') {
    return t('pages.characterEdit.abilities.weaponAreaOptions.point')
  }

  const areaMatch = area.match(/^(burst|blast)(\d+)$/)
  if (!areaMatch) {
    return area
  }

  return `${t(`pages.characterEdit.abilities.weaponAreaOptions.${areaMatch[1]}`)} ${areaMatch[2]}`
}

const buildNpcStatsLines = (
  npc: Pick<Npc, 'defenses' | 'hp'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return [
    t('pages.contextEdit.copy.npcStatsTitle'),
    `- ${[
      `${t('pages.npcEdit.fields.hp')} ${normalizeText(npc.hp)}`,
      `${t('pages.npcEdit.fields.kp')} ${normalizeText(npc.defenses.kp)}`,
      `${t('pages.npcEdit.fields.fortitude')} ${normalizeText(npc.defenses.fortitude)}`,
      `${t('pages.npcEdit.fields.reflex')} ${normalizeText(npc.defenses.reflex)}`,
      `${t('pages.npcEdit.fields.will')} ${normalizeText(npc.defenses.will)}`,
    ].join(' | ')}`,
  ]
}

const buildNpcAttackLines = (
  attacks: NpcAttack[],
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  if (attacks.length === 0) {
    return []
  }

  return [
    t('pages.contextEdit.copy.npcAttacksTitle'),
    ...attacks.map((attack) => {
      const attackName = normalizeText(attack.name) || t('pages.npcPrint.unnamedAttack')
      const attackTarget = attack.attackNotApplicable
        ? t('pages.npcEdit.attacks.notApplicable')
        : `+${normalizeText(attack.attackBonusNumber)} vs ${t(`pages.npcEdit.fields.${attack.attackDefense}`)}`

      return `- ${[
        attackName,
        t(`pages.npcEdit.attacks.typeOptions.${attack.type}`),
        t(`pages.characterEdit.abilities.actionOptions.${attack.action}`),
        `${t('pages.contextEdit.copy.attackRangeLabel')} ${normalizeText(attack.range)}`,
        `${t('pages.contextEdit.copy.attackAreaLabel')} ${buildNpcAttackAreaLabel(attack.area, t)}`,
        `${t('pages.npcEdit.attacks.attackLabel')}: ${attackTarget}`,
        normalizeText(attack.description),
      ].join(' | ')}`
    }),
  ]
}

const buildMonsterAttackAreaLabel = (
  area: MonsterAttackAreaType,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  if (area === 'point') {
    return t('pages.characterEdit.abilities.weaponAreaOptions.point')
  }

  const areaMatch = area.match(/^(burst|blast)(\d+)$/)
  if (!areaMatch) {
    return area
  }

  return `${t(`pages.characterEdit.abilities.weaponAreaOptions.${areaMatch[1]}`)} ${areaMatch[2]}`
}

const buildMonsterStatsLines = (
  monster: Pick<Monster, 'defenses' | 'hp'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return [
    t('pages.contextEdit.copy.monsterStatsTitle'),
    `- ${[
      `${t('pages.monsterEdit.fields.hp')} ${normalizeText(monster.hp)}`,
      `${t('pages.monsterEdit.fields.kp')} ${normalizeText(monster.defenses.kp)}`,
      `${t('pages.monsterEdit.fields.fortitude')} ${normalizeText(monster.defenses.fortitude)}`,
      `${t('pages.monsterEdit.fields.reflex')} ${normalizeText(monster.defenses.reflex)}`,
      `${t('pages.monsterEdit.fields.will')} ${normalizeText(monster.defenses.will)}`,
    ].join(' | ')}`,
  ]
}

const buildMonsterAttackLines = (
  attacks: MonsterAttack[],
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  if (attacks.length === 0) {
    return []
  }

  return [
    t('pages.contextEdit.copy.monsterAttacksTitle'),
    ...attacks.map((attack) => {
      const attackName = normalizeText(attack.name) || t('pages.monsterPrint.unnamedAttack')
      const attackTarget = attack.attackNotApplicable
        ? t('pages.monsterEdit.attacks.notApplicable')
        : `+${normalizeText(attack.attackBonusNumber)} vs ${t(`pages.monsterEdit.fields.${attack.attackDefense}`)}`

      return `- ${[
        attackName,
        t(`pages.monsterEdit.attacks.typeOptions.${attack.type}`),
        t(`pages.characterEdit.abilities.actionOptions.${attack.action}`),
        `${t('pages.contextEdit.copy.attackRangeLabel')} ${normalizeText(attack.range)}`,
        `${t('pages.contextEdit.copy.attackAreaLabel')} ${buildMonsterAttackAreaLabel(attack.area, t)}`,
        `${t('pages.monsterEdit.attacks.attackLabel')}: ${attackTarget}`,
        normalizeText(attack.description),
      ].join(' | ')}`
    }),
  ]
}

export const buildSingleMonsterContextCopyText = (
  monster: Pick<Monster, 'attacks' | 'defenses' | 'description' | 'hp' | 'level' | 'name' | 'role' | 'suggested' | 'type'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
  options: BuildSingleMonsterContextCopyTextOptions = {},
): string => {
  const monsterName = normalizeText(monster.name)
  const lines = [
    t('pages.contextEdit.copy.singleMonsterIntro', { name: monsterName }),
    '',
    `- ${[
      monsterName,
      t(`pages.monsterEdit.typeOptions.${monster.type}`),
      `${t('pages.contextEdit.copy.levelLabel')} ${normalizeText(monster.level)}`,
      t(`pages.monsterEdit.roleOptions.${monster.role}`),
      normalizeText(monster.description),
    ].join(' | ')}`,
  ]

  if (options.includeAttacks) {
    lines.push(
      '',
      ...buildMonsterStatsLines(monster, t),
      '',
      t('pages.contextEdit.copy.monsterDamageLegendTitle'),
      t('pages.contextEdit.copy.monsterDamageLegend', {
        low: t('pages.monsterEdit.fields.low'),
        medium: t('pages.monsterEdit.fields.medium'),
        high: t('pages.monsterEdit.fields.high'),
        custom: t('pages.monsterEdit.fields.custom'),
        lowDamage: normalizeText(monster.suggested.lowDamage),
        mediumDamage: normalizeText(monster.suggested.mediumDamage),
        highDamage: normalizeText(monster.suggested.highDamage),
        customDamage: normalizeText(monster.suggested.customDamage),
      }),
      '',
      ...buildMonsterAttackLines(monster.attacks, t),
    )
  }

  return lines.join('\n')
}

const buildNpcGroupLines = (
  groups: ContextNpcGroupSnapshot[],
  npcsById: Map<string, Npc>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return groups.flatMap((group) => {
    const npcBlocks = group.npcIds.map((npcId) => {
      const npc = npcsById.get(npcId)
      if (!npc) {
        return []
      }
      const parts = [
        normalizeText(npc.name),
        normalizeText(npc.description),
      ]
      if (!npc.isStory) {
        parts.push(`${t('pages.contextEdit.copy.levelLabel')} ${normalizeText(npc.level)}`)
      }
      parts.push(npc.isDead ? t('pages.contextEdit.copy.dead') : t('pages.contextEdit.copy.alive'))
      const npcName = normalizeText(npc.name)
      return [
        `- ${parts.join(' | ')}`,
        ...buildCharacterHistoryLines(npcName, npc.history, t),
      ]
    }).filter((block) => block.length > 0)
    if (npcBlocks.length === 0) {
      return []
    }
    return [normalizeText(group.name), ...npcBlocks.flatMap((block, index) => (index === 0 ? block : ['', ...block]))]
  })
}

const buildMonsterGroupLines = (
  groups: ContextMonsterGroupSnapshot[],
  monstersById: Map<string, Monster>,
  getMonsterTypeLabel: (monster: Monster) => string,
  getMonsterRoleLabel: (monster: Monster) => string,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return groups.flatMap((group) => {
    const monsterLines = group.monsterIds.flatMap((monsterId) => {
      const monster = monstersById.get(monsterId)
      if (!monster) {
        return []
      }
      return [
        `- ${[
          normalizeText(monster.name),
          getMonsterTypeLabel(monster),
          `${t('pages.contextEdit.copy.levelLabel')} ${normalizeText(monster.level)}`,
          getMonsterRoleLabel(monster),
          normalizeText(monster.description),
        ].join(' | ')}`,
      ]
    })
    if (monsterLines.length === 0) {
      return []
    }
    return [normalizeText(group.name), ...monsterLines]
  })
}

const buildAreaLines = (
  areas: ContextAreaSnapshot[],
  areasById: Map<string, Area>,
): string[] => {
  return areas.flatMap((areaSnapshot) => {
    const area = areasById.get(areaSnapshot.id)
    if (!area) {
      return []
    }
    const placesById = createMapById<PlaceItem>(area.places ?? [])
    const placeLines = areaSnapshot.placeIds.flatMap((placeId) => {
      const place = placesById.get(placeId)
      if (!place) {
        return []
      }
      return [`- ${normalizeText(place.name)} | ${normalizeText(place.description)}`]
    })
    return [`${normalizeText(area.name)} | ${normalizeText(area.description)}`, ...placeLines]
  })
}

export const buildSingleAreaContextCopyText = (
  area: Pick<Area, 'description' | 'name' | 'places'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  const areaName = normalizeText(area.name)
  const placeLines = (area.places ?? []).flatMap((place) => {
    const placeName = normalizeText(place.name)
    const placeDescription = normalizeText(place.description)

    if (!placeName && !placeDescription) {
      return []
    }

    return [`- ${placeName} | ${placeDescription}`]
  })
  const lines = [
    t('pages.contextEdit.copy.singleAreaIntro', { name: areaName }),
    '',
    `${areaName} | ${normalizeText(area.description)}`,
    ...placeLines,
  ]

  return lines.join('\n')
}

const buildEventLines = (eventIds: string[], eventsById: Map<string, Event>): string[] => {
  return eventIds.flatMap((eventId) => {
    const event = eventsById.get(eventId)
    if (!event) {
      return []
    }
    return [`${normalizeText(event.name)} | ${normalizeText(event.description)}`]
  })
}

export const buildSingleEventContextCopyText = (
  event: Pick<Event, 'description' | 'name'>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  const eventName = normalizeText(event.name)
  const lines = [
    t('pages.contextEdit.copy.singleEventIntro', { name: eventName }),
    '',
    `${eventName} | ${normalizeText(event.description)}`,
  ]

  return lines.join('\n')
}

export const buildSingleMapContextCopyText = (
  map: Pick<AppMapData, 'description' | 'grid' | 'name'>,
  getElementVariantName: (category: MapElementCategory, variant: MapElementVariant) => string,
  getGroundTextureName: (texture: MapGroundTexture) => string,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string => {
  const mapName = normalizeText(map.name)
  const copyMap = {
    name: mapName,
    description: normalizeText(map.description),
    grid: {
      ...map.grid,
      ground: map.grid.ground.map((cell) => ({
        ...cell,
        variantName: getGroundTextureName(cell.texture),
      })),
      elements: map.grid.elements.map((element) => ({
        ...element,
        variantName: getElementVariantName(element.category, element.variant),
      })),
    },
  }
  const lines = [
    t('pages.contextEdit.copy.singleMapIntro', { name: mapName }),
    '',
    `${mapName} | ${normalizeText(map.description)}`,
    '',
    t('pages.contextEdit.copy.singleMapTitle'),
    JSON.stringify(copyMap, null, 2),
  ]

  return lines.join('\n')
}

const buildContextCopyText = ({
  areasById,
  characterHistoryById,
  charactersById,
  eventsById,
  form,
  getCharacterClassLabel,
  getCharacterRaceLabel,
  getMonsterRoleLabel,
  getMonsterTypeLabel,
  monstersById,
  npcsById,
  t,
}: BuildContextCopyTextParams): string => {
  const lines = [t('pages.contextEdit.copy.intro')]
  const characterGroups = form.characters.length > 0
    ? [
      {
        id: '__legacy-characters',
        name: t('pages.contextEdit.characters.legacyGroupName'),
        characterIds: form.characters,
      },
      ...form.characterGroups,
    ]
    : form.characterGroups

  appendBlock(
    lines,
    t('pages.contextEdit.copy.heroesTitle'),
    buildCharacterGroupLines(characterGroups, charactersById, characterHistoryById, getCharacterRaceLabel, getCharacterClassLabel, t),
  )
  appendBlock(lines, t('pages.contextEdit.copy.npcGroupsTitle'), buildNpcGroupLines(form.npcGroups, npcsById, t))
  appendBlock(
    lines,
    t('pages.contextEdit.copy.monsterGroupsTitle'),
    buildMonsterGroupLines(form.monsterGroups, monstersById, getMonsterTypeLabel, getMonsterRoleLabel, t),
  )
  appendBlock(lines, t('pages.contextEdit.copy.areasTitle'), buildAreaLines(form.areas, areasById))
  appendBlock(lines, t('pages.contextEdit.copy.eventsTitle'), buildEventLines(form.events, eventsById))

  lines.push('', t('pages.contextEdit.copy.generalContextTitle'), normalizeText(form.description))
  return lines.join('\n')
}

const getContextCharacterIds = (form: ContextData): string[] => {
  const characterIds = new Set<string>()

  for (const characterId of form.characters) {
    characterIds.add(characterId)
  }

  for (const group of form.characterGroups) {
    for (const characterId of group.characterIds) {
      characterIds.add(characterId)
    }
  }

  return [...characterIds]
}

const loadCharacterHistories = async (form: ContextData): Promise<Map<string, CharacterHistoryEntry[]>> => {
  const entries = await Promise.all(
    getContextCharacterIds(form).map(async (characterId) => {
      const history = await getCharacterHistory(characterId)
      return [characterId, history] as const
    }),
  )

  return new Map(entries)
}

export const useContextCopy = ({
  areas,
  characters,
  events,
  monsters,
  npcs,
  onClearError,
  onError,
  saveCurrentContext,
}: UseContextCopyParams): ContextCopyState => {
  const { t } = useI18n()
  const presentation = useCharacterPresentation()
  const [copyingContext, setCopyingContext] = useState(false)

  const charactersById = useMemo(() => createMapById(characters), [characters])
  const npcsById = useMemo(() => createMapById(npcs), [npcs])
  const monstersById = useMemo(() => createMapById(monsters), [monsters])
  const areasById = useMemo(() => createMapById(areas), [areas])
  const eventsById = useMemo(() => createMapById(events), [events])

  const handleCopyContext = async () => {
    setCopyingContext(true)
    onClearError()

    try {
      const savedForm = await saveCurrentContext()
      const characterHistoryById = await loadCharacterHistories(savedForm)
      const text = buildContextCopyText({
        areasById,
        characterHistoryById,
        charactersById,
        eventsById,
        form: savedForm,
        getCharacterClassLabel: presentation.getClassLabel,
        getCharacterRaceLabel: presentation.getRaceLabel,
        getMonsterRoleLabel: (monster) => t(`pages.monsterEdit.roleOptions.${monster.role}`),
        getMonsterTypeLabel: (monster) => t(`pages.monsterEdit.typeOptions.${monster.type}`),
        monstersById,
        npcsById,
        t,
      })
      await copyTextToClipboard(text)
      toast.success(t('pages.contextEdit.copySuccess'))
    } catch (nextError) {
      const message = nextError instanceof Error && nextError.message === 'errors.api.generic'
        ? t('pages.contextEdit.copyError')
        : getErrorMessage(t, nextError)
      onError(message)
      toast.error(message)
    } finally {
      setCopyingContext(false)
    }
  }

  return {
    copyingContext,
    handleCopyContext,
  }
}
