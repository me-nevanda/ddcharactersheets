import { useEffect, useMemo, useState } from 'react'
import { listAreas, listCharacterGroups, listCharacters, listEvents, listMonsterGroups, listMonsters, listNpcGroups, listNpcs } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Area, PlaceItem } from '@appTypes/area'
import type { Character, CharacterGroup } from '@appTypes/character'
import type { Event } from '@appTypes/event'
import type { Monster, MonsterGroup } from '@appTypes/monster'
import type { Npc, NpcGroup } from '@appTypes/npc'

interface UseContextDataSourcesParams {
  setError: (getNextError: (current: string) => string) => void
  t: (key: string) => string
}

export const useContextDataSources = ({ setError, t }: UseContextDataSourcesParams) => {
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [allCharacterGroups, setAllCharacterGroups] = useState<CharacterGroup[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [allNpcs, setAllNpcs] = useState<Npc[]>([])
  const [allNpcGroups, setAllNpcGroups] = useState<NpcGroup[]>([])
  const [allMonsters, setAllMonsters] = useState<Monster[]>([])
  const [allMonsterGroups, setAllMonsterGroups] = useState<MonsterGroup[]>([])
  const [allAreas, setAllAreas] = useState<Area[]>([])

  useEffect(() => {
    let cancelled = false

    const loadCharacters = async () => {
      try {
        const characters = await listCharacters()
        if (!cancelled) {
          setAllCharacters(characters)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadCharacters()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  useEffect(() => {
    let cancelled = false

    const loadCharacterGroups = async () => {
      try {
        const characterGroups = await listCharacterGroups()
        if (!cancelled) {
          setAllCharacterGroups(characterGroups)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadCharacterGroups()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  useEffect(() => {
    let cancelled = false

    const loadEvents = async () => {
      try {
        const events = await listEvents()
        if (!cancelled) {
          setAllEvents(events)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadEvents()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  useEffect(() => {
    let cancelled = false

    const loadNpcData = async () => {
      try {
        const [npcGroups, npcs] = await Promise.all([listNpcGroups(), listNpcs()])
        if (!cancelled) {
          setAllNpcGroups(npcGroups)
          setAllNpcs(npcs)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadNpcData()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  useEffect(() => {
    let cancelled = false

    const loadMonsterData = async () => {
      try {
        const [monsterGroups, monsters] = await Promise.all([listMonsterGroups(), listMonsters()])
        if (!cancelled) {
          setAllMonsterGroups(monsterGroups)
          setAllMonsters(monsters)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadMonsterData()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  useEffect(() => {
    let cancelled = false

    const loadAreas = async () => {
      try {
        const areas = await listAreas()
        if (!cancelled) {
          setAllAreas(areas)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError((current) => current || getErrorMessage(t, nextError))
        }
      }
    }

    void loadAreas()

    return () => {
      cancelled = true
    }
  }, [setError, t])

  const charactersById = useMemo(() => new Map(allCharacters.map((character) => [character.id, character])), [allCharacters])
  const characterGroupsById = useMemo(() => new Map(allCharacterGroups.map((group) => [group.id, group])), [allCharacterGroups])
  const eventsById = useMemo(() => new Map(allEvents.map((event) => [event.id, event])), [allEvents])
  const npcsById = useMemo(() => new Map(allNpcs.map((npc) => [npc.id, npc])), [allNpcs])
  const npcGroupsById = useMemo(() => new Map(allNpcGroups.map((group) => [group.id, group])), [allNpcGroups])
  const monstersById = useMemo(() => new Map(allMonsters.map((monster) => [monster.id, monster])), [allMonsters])
  const monsterGroupsById = useMemo(() => new Map(allMonsterGroups.map((group) => [group.id, group])), [allMonsterGroups])
  const areasById = useMemo(() => new Map(allAreas.map((area) => [area.id, area])), [allAreas])
  const placesByAreaId = useMemo(() => {
    const map = new Map<string, Map<string, PlaceItem>>()
    for (const area of allAreas) {
      const placeMap = new Map<string, PlaceItem>()
      for (const place of area.places ?? []) {
        if (place) {
          placeMap.set(place.id, place)
        }
      }
      map.set(area.id, placeMap)
    }
    return map
  }, [allAreas])

  return {
    allAreas,
    allCharacterGroups,
    allCharacters,
    allEvents,
    allMonsterGroups,
    allMonsters,
    allNpcGroups,
    allNpcs,
    areasById,
    characterGroupsById,
    charactersById,
    eventsById,
    monsterGroupsById,
    monstersById,
    npcGroupsById,
    npcsById,
    placesByAreaId,
  }
}
