import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createAdventure, listAdventures } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Adventure } from '@appTypes/adventure'
import type { AdventureListCardViewModel, AdventureListPageState } from './types'

const buildPromptPreview = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim()
}

export const useAdventureListPage = (): AdventureListPageState => {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadAdventures = async () => {
      try {
        const nextAdventures = await listAdventures()
        if (!cancelled) {
          setAdventures(nextAdventures)
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

    void loadAdventures()

    return () => {
      cancelled = true
    }
  }, [t])

  const openAdventure = (adventureId: string) => {
    navigate(`/adventures/${adventureId}/edit`)
  }

  const handleCreateAdventure = async () => {
    setCreating(true)
    setError('')
    try {
      const adventure = await createAdventure()
      navigate(`/adventures/${adventure.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const cards: AdventureListCardViewModel[] = adventures.map((adventure) => ({
    id: adventure.id,
    label: adventure.name.trim() || t('pages.adventureList.unnamedAdventure'),
    promptPreview: buildPromptPreview(adventure.prompt),
    updatedAtLabel: dateFormatter.format(new Date(adventure.updatedAt)),
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openAdventure(adventure.id)
      }
    },
    onOpen: () => {
      openAdventure(adventure.id)
    },
  }))

  return {
    cards,
    creating,
    error,
    handleCreateAdventure,
    loading,
    showAdventureGrid: !loading && cards.length > 0,
    showEmptyState: !loading && cards.length === 0,
  }
}
