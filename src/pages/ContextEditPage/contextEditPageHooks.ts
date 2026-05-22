import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getContext, listCharacters, listMonsterGroups, listMonsters, listNpcGroups, listNpcs, saveContext } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { Character } from '@appTypes/character'
import type { ContextData, ContextMonsterGroupSnapshot, ContextNpcGroupSnapshot } from '@appTypes/context'
import type { Monster, MonsterGroup } from '@appTypes/monster'
import type { Npc, NpcGroup } from '@appTypes/npc'
import type {
  ContextCharacterCardViewModel,
  ContextCharacterOptionViewModel,
  ContextEditPageState,
  ContextMonsterCardViewModel,
  ContextMonsterGroupOptionViewModel,
  ContextMonsterGroupSectionViewModel,
  ContextNpcCardViewModel,
  ContextNpcGroupOptionViewModel,
  ContextNpcGroupSectionViewModel,
} from './types'

const emptyContextForm: ContextData = {
  uniqueId: '',
  name: '',
  description: '',
  characters: [],
  npcGroups: [],
  monsterGroups: [],
}

const areStringArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }
  return true
}

const areNpcGroupSnapshotsEqual = (
  left: ContextNpcGroupSnapshot[],
  right: ContextNpcGroupSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.npcIds, b.npcIds)) {
      return false
    }
  }
  return true
}

const areMonsterGroupSnapshotsEqual = (
  left: ContextMonsterGroupSnapshot[],
  right: ContextMonsterGroupSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.monsterIds, b.monsterIds)) {
      return false
    }
  }
  return true
}

const stripJsonExtension = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    return ''
  }
  return fileName.endsWith('.json') ? fileName.slice(0, -'.json'.length) : fileName
}

export const useContextEditPage = (): ContextEditPageState => {
  const { t } = useI18n()
  const { contextId = '' } = useParams()
  const presentation = useCharacterPresentation()
  const [form, setForm] = useState<ContextData>(emptyContextForm)
  const [initialForm, setInitialForm] = useState<ContextData>(emptyContextForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [isAddCharacterDialogOpen, setIsAddCharacterDialogOpen] = useState(false)
  const [characterSearch, setCharacterSearch] = useState('')
  const [selectedCharacterIdsInDialog, setSelectedCharacterIdsInDialog] = useState<string[]>([])

  const [allNpcs, setAllNpcs] = useState<Npc[]>([])
  const [allNpcGroups, setAllNpcGroups] = useState<NpcGroup[]>([])
  const [isAddNpcGroupDialogOpen, setIsAddNpcGroupDialogOpen] = useState(false)
  const [npcGroupSearch, setNpcGroupSearch] = useState('')
  const [selectedNpcGroupIdsInDialog, setSelectedNpcGroupIdsInDialog] = useState<string[]>([])

  const [allMonsters, setAllMonsters] = useState<Monster[]>([])
  const [allMonsterGroups, setAllMonsterGroups] = useState<MonsterGroup[]>([])
  const [isAddMonsterGroupDialogOpen, setIsAddMonsterGroupDialogOpen] = useState(false)
  const [monsterGroupSearch, setMonsterGroupSearch] = useState('')
  const [selectedMonsterGroupIdsInDialog, setSelectedMonsterGroupIdsInDialog] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    const loadContext = async () => {
      try {
        const context = await getContext(contextId)
        const nextForm: ContextData = {
          uniqueId: context.uniqueId,
          name: context.name,
          description: context.description,
          characters: Array.isArray(context.characters) ? context.characters : [],
          npcGroups: Array.isArray(context.npcGroups) ? context.npcGroups : [],
          monsterGroups: Array.isArray(context.monsterGroups) ? context.monsterGroups : [],
        }

        if (!cancelled) {
          setForm(nextForm)
          setInitialForm(nextForm)
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

    void loadContext()

    return () => {
      cancelled = true
    }
  }, [contextId, t])

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
  }, [t])

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
  }, [t])

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
  }, [t])

  const charactersById = useMemo(() => {
    const map = new Map<string, Character>()
    for (const character of allCharacters) {
      map.set(character.id, character)
    }
    return map
  }, [allCharacters])

  const npcsById = useMemo(() => {
    const map = new Map<string, Npc>()
    for (const npc of allNpcs) {
      map.set(npc.id, npc)
    }
    return map
  }, [allNpcs])

  const npcGroupsById = useMemo(() => {
    const map = new Map<string, NpcGroup>()
    for (const group of allNpcGroups) {
      map.set(group.id, group)
    }
    return map
  }, [allNpcGroups])

  const monstersById = useMemo(() => {
    const map = new Map<string, Monster>()
    for (const monster of allMonsters) {
      map.set(monster.id, monster)
    }
    return map
  }, [allMonsters])

  const monsterGroupsById = useMemo(() => {
    const map = new Map<string, MonsterGroup>()
    for (const group of allMonsterGroups) {
      map.set(group.id, group)
    }
    return map
  }, [allMonsterGroups])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // ----- Characters -----

  const handleRemoveCharacter = (characterId: string) => {
    setForm((current) => ({
      ...current,
      characters: current.characters.filter((id) => id !== characterId),
    }))
  }

  const handleOpenAddCharacterDialog = () => {
    setSelectedCharacterIdsInDialog([])
    setCharacterSearch('')
    setIsAddCharacterDialogOpen(true)
  }

  const handleCloseAddCharacterDialog = () => {
    setIsAddCharacterDialogOpen(false)
    setSelectedCharacterIdsInDialog([])
    setCharacterSearch('')
  }

  const handleToggleCharacterInDialog = (characterId: string) => {
    setSelectedCharacterIdsInDialog((current) => {
      if (current.includes(characterId)) {
        return current.filter((id) => id !== characterId)
      }
      return [...current, characterId]
    })
  }

  const handleConfirmAddCharacters = () => {
    if (selectedCharacterIdsInDialog.length === 0) {
      setIsAddCharacterDialogOpen(false)
      return
    }
    setForm((current) => {
      const existing = new Set(current.characters)
      const next = [...current.characters]
      for (const characterId of selectedCharacterIdsInDialog) {
        if (!existing.has(characterId)) {
          next.push(characterId)
          existing.add(characterId)
        }
      }
      return {
        ...current,
        characters: next,
      }
    })
    setIsAddCharacterDialogOpen(false)
    setSelectedCharacterIdsInDialog([])
    setCharacterSearch('')
  }

  // ----- NPC groups -----

  const handleRemoveNpcGroup = (groupId: string) => {
    setForm((current) => ({
      ...current,
      npcGroups: current.npcGroups.filter((group) => group.id !== groupId),
    }))
  }

  const handleRemoveNpcFromGroup = (groupId: string, npcId: string) => {
    setForm((current) => ({
      ...current,
      npcGroups: current.npcGroups.map((group) => {
        if (group.id !== groupId) {
          return group
        }
        return {
          ...group,
          npcIds: group.npcIds.filter((id) => id !== npcId),
        }
      }),
    }))
  }

  const handleOpenAddNpcGroupDialog = () => {
    setSelectedNpcGroupIdsInDialog([])
    setNpcGroupSearch('')
    setIsAddNpcGroupDialogOpen(true)
  }

  const handleCloseAddNpcGroupDialog = () => {
    setIsAddNpcGroupDialogOpen(false)
    setSelectedNpcGroupIdsInDialog([])
    setNpcGroupSearch('')
  }

  const handleToggleNpcGroupInDialog = (groupId: string) => {
    setSelectedNpcGroupIdsInDialog((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId)
      }
      return [...current, groupId]
    })
  }

  // ----- Monster groups -----

  const handleRemoveMonsterGroup = (groupId: string) => {
    setForm((current) => ({
      ...current,
      monsterGroups: current.monsterGroups.filter((group) => group.id !== groupId),
    }))
  }

  const handleRemoveMonsterFromGroup = (groupId: string, monsterId: string) => {
    setForm((current) => ({
      ...current,
      monsterGroups: current.monsterGroups.map((group) => {
        if (group.id !== groupId) {
          return group
        }
        return {
          ...group,
          monsterIds: group.monsterIds.filter((id) => id !== monsterId),
        }
      }),
    }))
  }

  const handleOpenAddMonsterGroupDialog = () => {
    setSelectedMonsterGroupIdsInDialog([])
    setMonsterGroupSearch('')
    setIsAddMonsterGroupDialogOpen(true)
  }

  const handleCloseAddMonsterGroupDialog = () => {
    setIsAddMonsterGroupDialogOpen(false)
    setSelectedMonsterGroupIdsInDialog([])
    setMonsterGroupSearch('')
  }

  const handleToggleMonsterGroupInDialog = (groupId: string) => {
    setSelectedMonsterGroupIdsInDialog((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId)
      }
      return [...current, groupId]
    })
  }

  const handleConfirmAddMonsterGroups = () => {
    if (selectedMonsterGroupIdsInDialog.length === 0) {
      setIsAddMonsterGroupDialogOpen(false)
      return
    }
    setForm((current) => {
      const existing = new Set(current.monsterGroups.map((group) => group.id))
      const additions: ContextMonsterGroupSnapshot[] = []
      for (const groupId of selectedMonsterGroupIdsInDialog) {
        if (existing.has(groupId)) {
          continue
        }
        const group = monsterGroupsById.get(groupId)
        if (!group) {
          continue
        }
        const monsterIds: string[] = []
        const seenMonsterIds = new Set<string>()
        for (const fileName of group.monsterFileNames ?? []) {
          const monsterId = stripJsonExtension(fileName)
          if (!monsterId || seenMonsterIds.has(monsterId)) {
            continue
          }
          seenMonsterIds.add(monsterId)
          monsterIds.push(monsterId)
        }
        additions.push({
          id: group.id,
          name: group.name,
          monsterIds,
        })
        existing.add(group.id)
      }
      if (additions.length === 0) {
        return current
      }
      return {
        ...current,
        monsterGroups: [...current.monsterGroups, ...additions],
      }
    })
    setIsAddMonsterGroupDialogOpen(false)
    setSelectedMonsterGroupIdsInDialog([])
    setMonsterGroupSearch('')
  }

  const handleConfirmAddNpcGroups = () => {
    if (selectedNpcGroupIdsInDialog.length === 0) {
      setIsAddNpcGroupDialogOpen(false)
      return
    }
    setForm((current) => {
      const existing = new Set(current.npcGroups.map((group) => group.id))
      const additions: ContextNpcGroupSnapshot[] = []
      for (const groupId of selectedNpcGroupIdsInDialog) {
        if (existing.has(groupId)) {
          continue
        }
        const group = npcGroupsById.get(groupId)
        if (!group) {
          continue
        }
        const npcIds: string[] = []
        const seenNpcIds = new Set<string>()
        for (const fileName of group.npcFileNames ?? []) {
          const npcId = stripJsonExtension(fileName)
          if (!npcId || seenNpcIds.has(npcId)) {
            continue
          }
          seenNpcIds.add(npcId)
          npcIds.push(npcId)
        }
        additions.push({
          id: group.id,
          name: group.name,
          npcIds,
        })
        existing.add(group.id)
      }
      if (additions.length === 0) {
        return current
      }
      return {
        ...current,
        npcGroups: [...current.npcGroups, ...additions],
      }
    })
    setIsAddNpcGroupDialogOpen(false)
    setSelectedNpcGroupIdsInDialog([])
    setNpcGroupSearch('')
  }

  // ----- Submit -----

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const nextForm: ContextData = {
        uniqueId: form.uniqueId,
        name: form.name.trim(),
        description: form.description.trim(),
        characters: [...form.characters],
        npcGroups: form.npcGroups.map((group) => ({
          id: group.id,
          name: group.name,
          npcIds: [...group.npcIds],
        })),
        monsterGroups: form.monsterGroups.map((group) => ({
          id: group.id,
          name: group.name,
          monsterIds: [...group.monsterIds],
        })),
      }
      await saveContext(contextId, nextForm)
      setForm(nextForm)
      setInitialForm(nextForm)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  // ----- View models: characters -----

  const buildCharacterCard = (characterId: string): ContextCharacterCardViewModel => {
    const character = charactersById.get(characterId)
    const label = character ? presentation.getCharacterLabel(character.name) : t('pages.contextEdit.characters.unknownCharacter')
    const raceLabel = character ? presentation.getRaceLabel(character.race) : ''
    const classLabel = character ? presentation.getClassLabel(character.class) : ''
    const level = character?.level ?? 0
    const imageSrc = character?.imageUrl ?? ''
    const portraitSrc = character ? presentation.getCharacterPortraitSrc(character.race, character.gender) : '/unnamed.png'
    const classSrc = character ? presentation.getCharacterClassSrc(character.class) : '/unnamed.png'
    return {
      id: characterId,
      label,
      raceLabel,
      classLabel,
      level,
      imageSrc,
      portraitSrc,
      classSrc,
      hasCustomImage: Boolean(imageSrc),
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveCharacter(characterId)
      },
    }
  }

  const characterCards: ContextCharacterCardViewModel[] = useMemo(() => {
    return form.characters.map(buildCharacterCard)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.characters, charactersById, t])

  const buildCharacterOption = (character: Character, selected: boolean): ContextCharacterOptionViewModel => {
    const label = presentation.getCharacterLabel(character.name)
    const onToggleSelected = () => handleToggleCharacterInDialog(character.id)
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggleCharacterInDialog(character.id)
      }
    }
    return {
      id: character.id,
      label,
      raceLabel: presentation.getRaceLabel(character.race),
      classLabel: presentation.getClassLabel(character.class),
      level: character.level,
      imageSrc: character.imageUrl ?? '',
      portraitSrc: presentation.getCharacterPortraitSrc(character.race, character.gender),
      classSrc: presentation.getCharacterClassSrc(character.class),
      hasCustomImage: Boolean(character.imageUrl),
      onToggleSelected,
      onKeyDown,
      selected,
    }
  }

  const characterOptions: ContextCharacterOptionViewModel[] = useMemo(() => {
    const assigned = new Set(form.characters)
    const search = characterSearch.trim().toLowerCase()
    const available = allCharacters.filter((character) => !assigned.has(character.id))
    const filtered = search
      ? available.filter((character) => {
        const name = (character.name ?? '').toLowerCase()
        return name.includes(search)
      })
      : available
    return filtered.map((character) => buildCharacterOption(character, selectedCharacterIdsInDialog.includes(character.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCharacters, characterSearch, form.characters, selectedCharacterIdsInDialog])

  // ----- View models: NPC groups -----

  const buildNpcCard = (groupId: string, npcId: string): ContextNpcCardViewModel => {
    const npc = npcsById.get(npcId)
    const label = npc?.name?.trim() || t('pages.npcList.unnamedNpc')
    const isStory = npc?.isStory === true
    const isElite = !isStory && npc?.type === 'elite'
    const isMinion = !isStory && npc?.type === 'minion'
    const isNormal = !isStory && npc?.type === 'normal'
    const isSolo = !isStory && npc?.type === 'solo'
    const roleLabel = npc ? t(`pages.npcEdit.roleOptions.${npc.role}`) : ''
    const typeLabel = npc ? t(`pages.npcEdit.typeOptions.${npc.type}`) : ''
    const imageSrc = npc?.imageUrl || '/favicon.png'
    return {
      id: npcId,
      label,
      roleLabel,
      typeLabel,
      level: npc?.level ?? 0,
      imageSrc,
      isStory,
      isElite,
      isMinion,
      isNormal,
      isSolo,
      isDead: npc?.isDead === true,
      storyLabel: t('pages.npcEdit.fields.isStory'),
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveNpcFromGroup(groupId, npcId)
      },
    }
  }

  const npcGroupSections: ContextNpcGroupSectionViewModel[] = useMemo(() => {
    return form.npcGroups.map((group) => ({
      id: group.id,
      name: (group.name && group.name.trim()) || t('pages.npcList.groups.unnamedGroup'),
      npcs: group.npcIds.map((npcId) => buildNpcCard(group.id, npcId)),
      onRemoveGroupClick: (event) => {
        event.stopPropagation()
        handleRemoveNpcGroup(group.id)
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.npcGroups, npcsById, t])

  const buildNpcGroupOption = (group: NpcGroup, selected: boolean): ContextNpcGroupOptionViewModel => {
    const label = (group.name && group.name.trim()) || t('pages.npcList.groups.unnamedGroup')
    const npcCount = Array.isArray(group.npcFileNames) ? group.npcFileNames.length : 0
    const onToggleSelected = () => handleToggleNpcGroupInDialog(group.id)
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggleNpcGroupInDialog(group.id)
      }
    }
    return {
      id: group.id,
      label,
      npcCount,
      npcCountLabel: t('pages.npcList.groups.npcCount', { count: npcCount }),
      onToggleSelected,
      onKeyDown,
      selected,
    }
  }

  // ----- View models: Monster groups -----

  const buildMonsterCard = (groupId: string, monsterId: string): ContextMonsterCardViewModel => {
    const monster = monstersById.get(monsterId)
    const label = monster?.name?.trim() || t('pages.monsterList.unnamedMonster')
    const isElite = monster?.type === 'elite'
    const isMinion = monster?.type === 'minion'
    const isNormal = monster?.type === 'normal'
    const isSolo = monster?.type === 'solo'
    const roleLabel = monster ? t(`pages.monsterEdit.roleOptions.${monster.role}`) : ''
    const typeLabel = monster ? t(`pages.monsterEdit.typeOptions.${monster.type}`) : ''
    const imageSrc = monster?.imageUrl || '/favicon.png'
    return {
      id: monsterId,
      label,
      roleLabel,
      typeLabel,
      level: monster?.level ?? 0,
      imageSrc,
      isElite,
      isMinion,
      isNormal,
      isSolo,
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveMonsterFromGroup(groupId, monsterId)
      },
    }
  }

  const monsterGroupSections: ContextMonsterGroupSectionViewModel[] = useMemo(() => {
    return form.monsterGroups.map((group) => ({
      id: group.id,
      name: (group.name && group.name.trim()) || t('pages.monsterList.groups.unnamedGroup'),
      monsters: group.monsterIds.map((monsterId) => buildMonsterCard(group.id, monsterId)),
      onRemoveGroupClick: (event) => {
        event.stopPropagation()
        handleRemoveMonsterGroup(group.id)
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.monsterGroups, monstersById, t])

  const buildMonsterGroupOption = (group: MonsterGroup, selected: boolean): ContextMonsterGroupOptionViewModel => {
    const label = (group.name && group.name.trim()) || t('pages.monsterList.groups.unnamedGroup')
    const monsterCount = Array.isArray(group.monsterFileNames) ? group.monsterFileNames.length : 0
    const onToggleSelected = () => handleToggleMonsterGroupInDialog(group.id)
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggleMonsterGroupInDialog(group.id)
      }
    }
    return {
      id: group.id,
      label,
      monsterCount,
      monsterCountLabel: t('pages.monsterList.groups.monsterCount', { count: monsterCount }),
      onToggleSelected,
      onKeyDown,
      selected,
    }
  }

  const monsterGroupOptions: ContextMonsterGroupOptionViewModel[] = useMemo(() => {
    const assigned = new Set(form.monsterGroups.map((group) => group.id))
    const search = monsterGroupSearch.trim().toLowerCase()
    const available = allMonsterGroups.filter((group) => !assigned.has(group.id))
    const filtered = search
      ? available.filter((group) => {
        const name = (group.name ?? '').toLowerCase()
        return name.includes(search)
      })
      : available
    return filtered.map((group) => buildMonsterGroupOption(group, selectedMonsterGroupIdsInDialog.includes(group.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMonsterGroups, monsterGroupSearch, form.monsterGroups, selectedMonsterGroupIdsInDialog])

  const npcGroupOptions: ContextNpcGroupOptionViewModel[] = useMemo(() => {
    const assigned = new Set(form.npcGroups.map((group) => group.id))
    const search = npcGroupSearch.trim().toLowerCase()
    const available = allNpcGroups.filter((group) => !assigned.has(group.id))
    const filtered = search
      ? available.filter((group) => {
        const name = (group.name ?? '').toLowerCase()
        return name.includes(search)
      })
      : available
    return filtered.map((group) => buildNpcGroupOption(group, selectedNpcGroupIdsInDialog.includes(group.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNpcGroups, npcGroupSearch, form.npcGroups, selectedNpcGroupIdsInDialog])

  // ----- hasChanges -----

  const hasChanges = useMemo(() => {
    if (form.uniqueId !== initialForm.uniqueId) return true
    if (form.name !== initialForm.name) return true
    if (form.description !== initialForm.description) return true
    if (!areStringArraysEqual(form.characters, initialForm.characters)) return true
    if (!areNpcGroupSnapshotsEqual(form.npcGroups, initialForm.npcGroups)) return true
    if (!areMonsterGroupSnapshotsEqual(form.monsterGroups, initialForm.monsterGroups)) return true
    return false
  }, [form, initialForm])

  return {
    error,
    form,
    handleChange,
    handleSubmit,
    hasChanges,
    loading,
    saving,
    characterCards,
    characterOptions,
    characterSearch,
    handleChangeCharacterSearch: setCharacterSearch,
    isAddCharacterDialogOpen,
    handleOpenAddCharacterDialog,
    handleCloseAddCharacterDialog,
    handleConfirmAddCharacters,
    selectedCharacterIdsInDialog,
    hasSelectedCharactersInDialog: selectedCharacterIdsInDialog.length > 0,
    npcGroupSections,
    npcGroupOptions,
    npcGroupSearch,
    handleChangeNpcGroupSearch: setNpcGroupSearch,
    isAddNpcGroupDialogOpen,
    handleOpenAddNpcGroupDialog,
    handleCloseAddNpcGroupDialog,
    handleConfirmAddNpcGroups,
    selectedNpcGroupIdsInDialog,
    hasSelectedNpcGroupsInDialog: selectedNpcGroupIdsInDialog.length > 0,
    monsterGroupSections,
    monsterGroupOptions,
    monsterGroupSearch,
    handleChangeMonsterGroupSearch: setMonsterGroupSearch,
    isAddMonsterGroupDialogOpen,
    handleOpenAddMonsterGroupDialog,
    handleCloseAddMonsterGroupDialog,
    handleConfirmAddMonsterGroups,
    selectedMonsterGroupIdsInDialog,
    hasSelectedMonsterGroupsInDialog: selectedMonsterGroupIdsInDialog.length > 0,
  }
}
