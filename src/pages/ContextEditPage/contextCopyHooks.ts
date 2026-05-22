import { useMemo, useState } from 'react'
import { useI18n } from '@i18n/index'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { Area, PlaceItem } from '@appTypes/area'
import type { Character } from '@appTypes/character'
import type { ContextAreaSnapshot, ContextData, ContextMonsterGroupSnapshot, ContextNpcGroupSnapshot } from '@appTypes/context'
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

const appendBlock = (lines: string[], title: string, blockLines: string[]) => {
  if (blockLines.length === 0) {
    return
  }
  if (lines.length > 0) {
    lines.push('')
  }
  lines.push(title, ...blockLines)
}

const buildCharacterLines = (
  characterIds: string[],
  charactersById: Map<string, Character>,
  getCharacterRaceLabel: (value: Character['race']) => string,
  getCharacterClassLabel: (value: Character['class']) => string,
): string[] => {
  return characterIds.flatMap((characterId) => {
    const character = charactersById.get(characterId)
    if (!character) {
      return []
    }
    return [
      [
        normalizeText(character.name),
        normalizeText(character.level),
        getCharacterRaceLabel(character.race),
        getCharacterClassLabel(character.class),
        normalizeText(character.description),
      ].join(' | '),
    ]
  })
}

const buildNpcGroupLines = (
  groups: ContextNpcGroupSnapshot[],
  npcsById: Map<string, Npc>,
  t: (key: string, variables?: Record<string, string | number>) => string,
): string[] => {
  return groups.flatMap((group) => {
    const npcLines = group.npcIds.flatMap((npcId) => {
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
      return [`- ${parts.join(' | ')}`]
    })
    if (npcLines.length === 0) {
      return []
    }
    return [normalizeText(group.name), ...npcLines]
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

  appendBlock(
    lines,
    t('pages.contextEdit.copy.heroesTitle'),
    buildCharacterLines(form.characters, charactersById, getCharacterRaceLabel, getCharacterClassLabel),
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
  const [copyStatus, setCopyStatus] = useState('')

  const charactersById = useMemo(() => createMapById(characters), [characters])
  const npcsById = useMemo(() => createMapById(npcs), [npcs])
  const monstersById = useMemo(() => createMapById(monsters), [monsters])
  const areasById = useMemo(() => createMapById(areas), [areas])
  const eventsById = useMemo(() => createMapById(events), [events])

  const handleCopyContext = async () => {
    setCopyingContext(true)
    setCopyStatus('')
    onClearError()

    try {
      const savedForm = await saveCurrentContext()
      const text = buildContextCopyText({
        areasById,
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
      setCopyStatus(t('pages.contextEdit.copySuccess'))
    } catch (nextError) {
      onError(nextError instanceof Error && nextError.message === 'errors.api.generic'
        ? t('pages.contextEdit.copyError')
        : getErrorMessage(t, nextError))
    } finally {
      setCopyingContext(false)
    }
  }

  return {
    copyingContext,
    copyStatus,
    handleCopyContext,
  }
}
