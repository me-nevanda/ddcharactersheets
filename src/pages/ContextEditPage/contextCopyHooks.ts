import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useI18n } from '@i18n/index'
import { getCharacterHistory } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { Area, PlaceItem } from '@appTypes/area'
import type { Character, CharacterHistoryEntry } from '@appTypes/character'
import type { ContextAreaSnapshot, ContextCharacterGroupSnapshot, ContextData, ContextMonsterGroupSnapshot, ContextNpcGroupSnapshot } from '@appTypes/context'
import type { Event } from '@appTypes/event'
import type { Monster } from '@appTypes/monster'
import type { Npc } from '@appTypes/npc'
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

const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!copied) {
    throw new Error('errors.api.generic')
  }
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

interface ContextHistoryEntry {
  title: string
  content: string
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

const buildEventLines = (eventIds: string[], eventsById: Map<string, Event>): string[] => {
  return eventIds.flatMap((eventId) => {
    const event = eventsById.get(eventId)
    if (!event) {
      return []
    }
    return [`${normalizeText(event.name)} | ${normalizeText(event.description)}`]
  })
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
  form,
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
