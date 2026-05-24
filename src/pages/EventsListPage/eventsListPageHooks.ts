import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createEvent, deleteEvent, listEvents } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { Event } from '@appTypes/event'
import type { EventListCardViewModel, EventsListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const useEventsListPage = (): EventsListPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
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
    navigate(`/events/${eventId}/edit`)
  }

  const handleCreateEvent = async () => {
    setCreating(true)
    setError('')
    try {
      const event = await createEvent()
      navigate(`/events/${event.id}/edit`)
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

  const cards: EventListCardViewModel[] = events.map((event) => ({
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
    handleCloseDeleteDialog,
    handleConfirmDeleteEvent,
    handleCreateEvent,
    handleOpenDeleteDialog,
    loading,
    showEmptyState: !loading && cards.length === 0,
    showEventGrid: !loading && cards.length > 0,
  }
}
