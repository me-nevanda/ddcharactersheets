import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createContext, deleteContext, listContexts } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Context } from '@appTypes/context'
import type { ContextListCardViewModel, ContextsListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const useContextsListPage = (): ContextsListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [contexts, setContexts] = useState<Context[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [contextToDelete, setContextToDelete] = useState<Context | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadContexts = async () => {
      try {
        const nextContexts = await listContexts()
        if (!cancelled) {
          setContexts(nextContexts)
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

    void loadContexts()

    return () => {
      cancelled = true
    }
  }, [t])

  const openContext = (contextId: string) => {
    navigate(`/contexts/${contextId}/edit`)
  }

  const handleCreateContext = async () => {
    setCreating(true)
    setError('')
    try {
      const context = await createContext()
      navigate(`/contexts/${context.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleOpenDeleteDialog = (context: Context) => {
    setContextToDelete(context)
  }

  const handleCloseDeleteDialog = () => {
    setContextToDelete(null)
  }

  const handleConfirmDeleteContext = async () => {
    if (!contextToDelete) {
      return
    }

    setDeletingId(contextToDelete.id)
    setError('')

    try {
      await deleteContext(contextToDelete.id)
      setContexts((current) => current.filter((item) => item.id !== contextToDelete.id))
      setContextToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const cards: ContextListCardViewModel[] = contexts.map((context) => ({
    id: context.id,
    deleting: deletingId === context.id,
    description: buildTextPreview(context.description),
    label: context.name.trim() || t('pages.contextList.unnamedContext'),
    onDeleteClick: (mouseEvent) => {
      mouseEvent.stopPropagation()
      handleOpenDeleteDialog(context)
    },
    onKeyDown: (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault()
        openContext(context.id)
      }
    },
    onOpen: () => {
      openContext(context.id)
    },
  }))

  return {
    cards,
    creating,
    deleteDialogContextName: contextToDelete?.name.trim() || t('pages.contextList.unnamedContext'),
    deletingId,
    error,
    contextToDelete,
    handleCloseDeleteDialog,
    handleConfirmDeleteContext,
    handleCreateContext,
    handleOpenDeleteDialog,
    loading,
    showEmptyState: !loading && cards.length === 0,
    showContextGrid: !loading && cards.length > 0,
  }
}
