import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createMonster, deleteMonster, listMonsters } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Monster } from '@appTypes/monster'
import type { MonsterListCardViewModel, MonstersListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const useMonstersListPage = (): MonstersListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [monsterToDelete, setMonsterToDelete] = useState<Monster | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMonsters = async () => {
      try {
        const nextMonsters = await listMonsters()
        if (!cancelled) {
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

    void loadMonsters()

    return () => {
      cancelled = true
    }
  }, [t])

  const openMonster = (monsterId: string) => {
    navigate(`/monsters/${monsterId}/edit`)
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
    label: monster.name.trim() || t('pages.monsterList.unnamedMonster'),
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
  }))

  return {
    cards,
    creating,
    deletingId,
    deleteDialogMonsterName: monsterToDelete?.name.trim() || t('pages.monsterList.unnamedMonster'),
    error,
    handleCloseDeleteDialog,
    handleConfirmDeleteMonster,
    handleCreateMonster,
    loading,
    monsterToDelete,
    showEmptyState: !loading && cards.length === 0,
    showMonsterGrid: !loading && cards.length > 0,
  }
}
