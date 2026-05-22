import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getContext, saveContext } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import type { ContextData } from '@appTypes/context'
import type { ContextEditPageState } from './types'

const emptyContextForm: ContextData = {
  uniqueId: '',
  name: '',
  description: '',
}

export const useContextEditPage = (): ContextEditPageState => {
  const { t } = useI18n()
  const { contextId = '' } = useParams()
  const [form, setForm] = useState<ContextData>(emptyContextForm)
  const [initialForm, setInitialForm] = useState<ContextData>(emptyContextForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadContext = async () => {
      try {
        const context = await getContext(contextId)
        const nextForm: ContextData = {
          uniqueId: context.uniqueId,
          name: context.name,
          description: context.description,
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
      const nextForm: ContextData = {
        uniqueId: form.uniqueId,
        name: form.name.trim(),
        description: form.description.trim(),
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
