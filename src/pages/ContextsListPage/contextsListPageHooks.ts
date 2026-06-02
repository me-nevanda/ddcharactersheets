import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createContext, deleteContext, listContexts } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { EditReturnState } from '@pages/useEditReturnNavigation'
import type { Context } from '@appTypes/context'
import type { ContextListCardViewModel, ContextsListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeSearchValue = (value: string): string => {
  return value.trim().toLocaleLowerCase()
}

const contextListReturnState: EditReturnState = {
  mainTab: 'contexts',
  returnTo: '/',
}

export const useContextsListPage = (): ContextsListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [contexts, setContexts] = useState<Context[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [contextToDelete, setContextToDelete] = useState<Context | null>(null)
  const [listSearch, setListSearch] = useState('')
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
    navigate(`/contexts/${contextId}/edit`, { state: contextListReturnState })
  }

  const handleCreateContext = async () => {
    setCreating(true)
    setError('')
    try {
      const context = await createContext()
      navigate(`/contexts/${context.id}/edit`, { state: contextListReturnState })
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

  const normalizedListSearch = normalizeSearchValue(listSearch)
  const filteredContexts = normalizedListSearch
    ? contexts.filter((context) => normalizeSearchValue(context.name.trim() || t('pages.contextList.unnamedContext')).includes(normalizedListSearch))
    : contexts

  const cards: ContextListCardViewModel[] = filteredContexts.map((context) => ({
    id: context.id,
    deleting: deletingId === context.id,
    description: buildTextPreview(context.description),
    imageUrl: context.imageUrl,
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
    handleChangeListSearch: setListSearch,
    handleCloseDeleteDialog,
    handleConfirmDeleteContext,
    handleCreateContext,
    handleOpenDeleteDialog,
    listSearch,
    loading,
    showEmptySearchState: !loading && contexts.length > 0 && cards.length === 0,
    showEmptyState: !loading && contexts.length === 0,
    showContextGrid: !loading && cards.length > 0,
  }
}
