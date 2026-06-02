import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createEvent, deleteEvent, listEvents } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { EditReturnState } from '@pages/useEditReturnNavigation'
import type { Event } from '@appTypes/event'
import type { EventListCardViewModel, EventsListPageState } from './types'

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

const eventListReturnState: EditReturnState = {
  mainTab: 'events',
  returnTo: '/',
}

export const useEventsListPage = (): EventsListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [listSearch, setListSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadEvents = async () => {
      try {
        const nextEvents = await listEvents()
        if (!cancelled) {
          setEvents(nextEvents)
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

    void loadEvents()

    return () => {
      cancelled = true
    }
  }, [t])

  const openEvent = (eventId: string) => {
    navigate(`/events/${eventId}/edit`, { state: eventListReturnState })
  }

  const handleCreateEvent = async () => {
    setCreating(true)
    setError('')
    try {
      const event = await createEvent()
      navigate(`/events/${event.id}/edit`, { state: eventListReturnState })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleOpenDeleteDialog = (event: Event) => {
    setEventToDelete(event)
  }

  const handleCloseDeleteDialog = () => {
    setEventToDelete(null)
  }

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) {
      return
    }

    setDeletingId(eventToDelete.id)
    setError('')

    try {
      await deleteEvent(eventToDelete.id)
      setEvents((current) => current.filter((item) => item.id !== eventToDelete.id))
      setEventToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const normalizedListSearch = normalizeSearchValue(listSearch)
  const filteredEvents = normalizedListSearch
    ? events.filter((event) => normalizeSearchValue(event.name.trim() || t('pages.eventList.unnamedEvent')).includes(normalizedListSearch))
    : events

  const cards: EventListCardViewModel[] = filteredEvents.map((event) => ({
    id: event.id,
    deleting: deletingId === event.id,
    description: buildTextPreview(event.description),
    imageUrl: event.imageUrl,
    label: event.name.trim() || t('pages.eventList.unnamedEvent'),
    onDeleteClick: (mouseEvent) => {
      mouseEvent.stopPropagation()
      handleOpenDeleteDialog(event)
    },
    onKeyDown: (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault()
        openEvent(event.id)
      }
    },
    onOpen: () => {
      openEvent(event.id)
    },
  }))

  return {
    cards,
    creating,
    deleteDialogEventName: eventToDelete?.name.trim() || t('pages.eventList.unnamedEvent'),
    deletingId,
    error,
    eventToDelete,
    handleChangeListSearch: setListSearch,
    handleCloseDeleteDialog,
    handleConfirmDeleteEvent,
    handleCreateEvent,
    handleOpenDeleteDialog,
    listSearch,
    loading,
    showEmptySearchState: !loading && events.length > 0 && cards.length === 0,
    showEmptyState: !loading && events.length === 0,
    showEventGrid: !loading && cards.length > 0,
  }
}
