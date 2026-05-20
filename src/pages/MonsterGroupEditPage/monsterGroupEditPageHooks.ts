import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getMonsterGroup, listMonsters, saveMonsterGroup } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Monster, MonsterGroup } from '@appTypes/monster'
import type { AssignedMonsterGroupMonsterViewModel, MonsterGroupEditPageState, MonsterGroupMonsterOptionViewModel, MonsterGroupMonsterViewModel } from './types'

const emptyGroup: MonsterGroup = {
  id: '',
  uniqueId: '',
  name: '',
  monsterFileNames: [],
  updatedAt: '',
}

const getMonsterFileName = (monsterId: string): string => {
  return `${monsterId}.json`
}

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildMonsterViewModel = (
  monster: Monster,
  t: ReturnType<typeof useI18n>['t'],
): MonsterGroupMonsterViewModel => {
  return {
    descriptionPreview: buildTextPreview(monster.description),
    fileName: getMonsterFileName(monster.id),
    id: monster.id,
    imageSrc: monster.imageUrl || '/favicon.png',
    isElite: monster.type === 'elite',
    isMinion: monster.type === 'minion',
    isNormal: monster.type === 'normal',
    isSolo: monster.type === 'solo',
    label: monster.name.trim() || t('pages.monsterList.unnamedMonster'),
    level: monster.level,
    roleLabel: t(`pages.monsterEdit.roleOptions.${monster.role}`),
    typeLabel: t(`pages.monsterEdit.typeOptions.${monster.type}`),
  }
}

export const useMonsterGroupEditPage = (): MonsterGroupEditPageState => {
  const { t } = useI18n()
  const { groupId = '' } = useParams()
  const [form, setForm] = useState<MonsterGroup>(emptyGroup)
  const [initialForm, setInitialForm] = useState<MonsterGroup>(emptyGroup)
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [monsterSearch, setMonsterSearch] = useState('')
  const [assignedMonsterSearch, setAssignedMonsterSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGroup = async () => {
      try {
        const [nextGroup, nextMonsters] = await Promise.all([
          getMonsterGroup(groupId),
          listMonsters(),
        ])

        if (!cancelled) {
          setForm(nextGroup)
          setInitialForm(nextGroup)
          setMonsters(nextMonsters)
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

    void loadGroup()

    return () => {
      cancelled = true
    }
  }, [groupId, t])

  const handleChangeGroupName = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
    }))
  }

  const handleChangeMonsterSearch = (value: string) => {
    setMonsterSearch(value)
  }

  const handleChangeAssignedMonsterSearch = (value: string) => {
    setAssignedMonsterSearch(value)
  }

  const handleAddMonster = (monsterId: string) => {
    const fileName = getMonsterFileName(monsterId)
    setForm((current) => {
      if (current.monsterFileNames.includes(fileName)) {
        return current
      }

      return {
        ...current,
        monsterFileNames: [...current.monsterFileNames, fileName],
      }
    })
  }

  const handleRemoveMonster = (monsterId: string) => {
    const fileName = getMonsterFileName(monsterId)
    setForm((current) => ({
      ...current,
      monsterFileNames: current.monsterFileNames.filter((currentFileName) => currentFileName !== fileName),
    }))
  }

  const handleSubmit: MonsterGroupEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const savedGroup = await saveMonsterGroup(groupId, {
        ...form,
        name: form.name.trim(),
      })
      setForm(savedGroup)
      setInitialForm(savedGroup)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const assignedMonsterFileNames = new Set(form.monsterFileNames)
  const normalizedAssignedMonsterSearch = assignedMonsterSearch.trim().toLocaleLowerCase()
  const allAssignedMonsters: AssignedMonsterGroupMonsterViewModel[] = form.monsterFileNames
    .map((fileName) => monsters.find((monster) => getMonsterFileName(monster.id) === fileName))
    .filter((monster): monster is Monster => Boolean(monster))
    .map((monster) => ({
      ...buildMonsterViewModel(monster, t),
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveMonster(monster.id)
      },
    }))
  const assignedMonsters = normalizedAssignedMonsterSearch.length >= 3
    ? allAssignedMonsters.filter((monster) => monster.label.toLocaleLowerCase().includes(normalizedAssignedMonsterSearch))
    : allAssignedMonsters

  const normalizedMonsterSearch = monsterSearch.trim().toLocaleLowerCase()
  const availableMonsters = monsters.filter((monster) => !assignedMonsterFileNames.has(getMonsterFileName(monster.id)))
  const filteredMonsters = normalizedMonsterSearch.length >= 3
    ? availableMonsters.filter((monster) => (monster.name.trim() || t('pages.monsterList.unnamedMonster')).toLocaleLowerCase().includes(normalizedMonsterSearch))
    : availableMonsters.slice(0, 8)
  const monsterOptions: MonsterGroupMonsterOptionViewModel[] = filteredMonsters.map((monster) => ({
    ...buildMonsterViewModel(monster, t),
    onAddClick: (event) => {
      event.stopPropagation()
      handleAddMonster(monster.id)
    },
  }))

  return {
    assignedMonsters,
    assignedMonsterSearch,
    error,
    groupName: form.name,
    handleChangeAssignedMonsterSearch,
    handleChangeGroupName,
    handleChangeMonsterSearch,
    handleSubmit,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    loading,
    monsterOptions,
    monsterSearch,
    saving,
  }
}
