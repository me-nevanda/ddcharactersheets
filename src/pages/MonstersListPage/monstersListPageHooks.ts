import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createMonster, createMonsterGroup, deleteMonster, listMonsterGroups, listMonsters } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Monster, MonsterGroup } from '@appTypes/monster'
import type { MonsterGroupCardViewModel, MonsterListCardViewModel, MonsterListTabKey, MonstersListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const getMonsterFileName = (monsterId: string): string => {
  return `${monsterId}.json`
}

export const useMonstersListPage = (): MonstersListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [groups, setGroups] = useState<MonsterGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [creating, setCreating] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [monsterToDelete, setMonsterToDelete] = useState<Monster | null>(null)
  const [activeTab, setActiveTab] = useState<MonsterListTabKey>('groups')
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMonsters = async () => {
      try {
        const [nextMonsters, nextGroups] = await Promise.all([
          listMonsters(),
          listMonsterGroups(),
        ])
        if (!cancelled) {
          setMonsters(nextMonsters)
          setGroups(nextGroups)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingGroups(false)
        }
      }
    }

    void loadMonsters()

    return () => {
      cancelled = true
    }
  }, [t])

  const openMonster = (monsterId: string) => {
    navigate(`/monsters/${monsterId}/edit`)
  }

  const openGroup = (groupId: string) => {
    navigate(`/monster-groups/${groupId}/edit`)
  }

  const handleCreateMonster = async () => {
    setCreating(true)
    setError('')
    try {
      const monster = await createMonster()
      navigate(`/monsters/${monster.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleOpenCreateGroupDialog = () => {
    setGroupName('')
    setShowCreateGroupDialog(true)
  }

  const handleCancelCreateGroup = () => {
    if (creatingGroup) {
      return
    }

    setGroupName('')
    setShowCreateGroupDialog(false)
  }

  const handleChangeGroupName = (value: string) => {
    setGroupName(value)
  }

  const handleCreateGroupSubmit: MonstersListPageState['handleCreateGroupSubmit'] = async (event) => {
    event.preventDefault()

    const nextName = groupName.trim()
    if (!nextName) {
      return
    }

    setCreatingGroup(true)
    setError('')

    try {
      const group = await createMonsterGroup(nextName)
      navigate(`/monster-groups/${group.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleOpenDeleteDialog = (monster: Monster) => {
    setMonsterToDelete(monster)
  }

  const handleCloseDeleteDialog = () => {
    setMonsterToDelete(null)
  }

  const handleConfirmDeleteMonster = async () => {
    if (!monsterToDelete) {
      return
    }

    setDeletingId(monsterToDelete.id)
    setError('')

    try {
      await deleteMonster(monsterToDelete.id)
      setMonsters((currentMonsters) => currentMonsters.filter((monster) => monster.id !== monsterToDelete.id))
      setMonsterToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const cards: MonsterListCardViewModel[] = monsters.map((monster) => ({
    deleting: deletingId === monster.id,
    descriptionPreview: buildTextPreview(monster.description),
    id: monster.id,
    imageSrc: monster.imageUrl || '/favicon.png',
    isElite: monster.type === 'elite',
    isMinion: monster.type === 'minion',
    isNormal: monster.type === 'normal',
    isSolo: monster.type === 'solo',
    label: monster.name.trim() || t('pages.monsterList.unnamedMonster'),
    level: monster.level,
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteDialog(monster)
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openMonster(monster.id)
      }
    },
    onOpen: () => {
      openMonster(monster.id)
    },
    roleLabel: t(`pages.monsterEdit.roleOptions.${monster.role}`),
    typeLabel: t(`pages.monsterEdit.typeOptions.${monster.type}`),
  }))

  const groupCards: MonsterGroupCardViewModel[] = groups.map((group) => ({
    hasMoreMonsters: group.monsterFileNames.length > 4,
    id: group.id,
    monsterCount: group.monsterFileNames.length,
    monsterThumbnails: group.monsterFileNames
      .map((fileName) => monsters.find((monster) => getMonsterFileName(monster.id) === fileName))
      .filter((monster): monster is Monster => Boolean(monster))
      .slice(0, 4)
      .map((monster) => ({
        imageSrc: monster.imageUrl || '/favicon.png',
        label: monster.name.trim() || t('pages.monsterList.unnamedMonster'),
      })),
    name: group.name,
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openGroup(group.id)
      }
    },
    onOpen: () => {
      openGroup(group.id)
    },
  }))

  return {
    activeTab,
    cards,
    creating,
    creatingGroup,
    deletingId,
    deleteDialogMonsterName: monsterToDelete?.name.trim() || t('pages.monsterList.unnamedMonster'),
    error,
    groupName,
    groups: groupCards,
    handleCancelCreateGroup,
    handleChangeGroupName,
    handleCloseDeleteDialog,
    handleConfirmDeleteMonster,
    handleCreateGroupSubmit,
    handleCreateMonster,
    handleOpenCreateGroupDialog,
    loading,
    loadingGroups,
    monsterToDelete,
    setActiveTab,
    showCreateGroupDialog,
    showEmptyState: !loading && cards.length === 0,
    showEmptyGroupsState: !loadingGroups && groupCards.length === 0,
    showGroupList: !loadingGroups && groupCards.length > 0,
    showMonsterGrid: !loading && cards.length > 0,
  }
}
