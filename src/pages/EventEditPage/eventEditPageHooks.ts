import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getEvent, saveEvent } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { EventData } from '@appTypes/event'
import type { EventEditPageState } from './types'

const emptyEventForm: EventData = {
  uniqueId: '',
  name: '',
  description: '',
}

export const useEventEditPage = (): EventEditPageState => {
  const { t } = useI18n()
  const { eventId = '' } = useParams()
  const [form, setForm] = useState<EventData>(emptyEventForm)
  const [initialForm, setInitialForm] = useState<EventData>(emptyEventForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadEvent = async () => {
      try {
        const event = await getEvent(eventId)
        const nextForm: EventData = {
          uniqueId: event.uniqueId,
          name: event.name,
          description: event.description,
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

    void loadEvent()

    return () => {
      cancelled = true
    }
  }, [eventId, t])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const nextForm: EventData = {
        uniqueId: form.uniqueId,
        name: form.name.trim(),
        description: form.description.trim(),
      }
      await saveEvent(eventId, nextForm)
      setForm(nextForm)
      setInitialForm(nextForm)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  return {
    error,
    form,
    handleChange,
    handleSubmit,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    loading,
    saving,
  }
}
