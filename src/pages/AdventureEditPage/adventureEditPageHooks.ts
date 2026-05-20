import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { countGeminiTokens, createGeminiResponse, getAdventure, saveAdventure } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useMainPageContext } from '@pages/main/mainPageContext'
import type { AdventureData } from '@appTypes/adventure'
import type { AdventureEditPageState } from './types'
import type { GeminiUsage } from '@lib/api'

const emptyAdventure: AdventureData = {
  uniqueId: '',
  name: '',
  prompt: '',
  output: '',
}

const areAdventuresEqual = (left: AdventureData, right: AdventureData): boolean => {
  return left.uniqueId === right.uniqueId && left.name === right.name && left.prompt === right.prompt && left.output === right.output
}

const adventureInstructions = 'You are a D&D 4.0 game master. Reply in Polish. Write descriptively, not schematically, as if you were running a session.'
const geminiRequestCountPrefix = 'did.gemini.requests.'

const getTodayRequestStorageKey = (): string => {
  return `${geminiRequestCountPrefix}${new Date().toISOString().slice(0, 10)}`
}

const readTodayRequestCount = (): number => {
  if (typeof window === 'undefined') {
    return 0
  }

  const value = Number.parseInt(window.localStorage.getItem(getTodayRequestStorageKey()) ?? '0', 10)
  return Number.isFinite(value) ? value : 0
}

const saveTodayRequestCount = (value: number): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getTodayRequestStorageKey(), String(value))
}

export const useAdventureEditPage = (): AdventureEditPageState => {
  const { t } = useI18n()
  const { adventureId = '' } = useParams()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const [form, setForm] = useState<AdventureData>(emptyAdventure)
  const [savedAdventure, setSavedAdventure] = useState<AdventureData>(emptyAdventure)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [promptTokenCount, setPromptTokenCount] = useState<number | null>(null)
  const [lastUsage, setLastUsage] = useState<GeminiUsage | null>(null)
  const [todayRequestCount, setTodayRequestCount] = useState(readTodayRequestCount)

  useEffect(() => {
    let cancelled = false

    const loadAdventure = async () => {
      try {
        const adventure = await getAdventure(adventureId)
        const nextAdventure: AdventureData = {
          uniqueId: adventure.uniqueId,
          name: adventure.name,
          prompt: adventure.prompt,
          output: adventure.output,
        }
        if (!cancelled) {
          setForm(nextAdventure)
          setSavedAdventure(nextAdventure)
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

    void loadAdventure()

    return () => {
      cancelled = true
    }
  }, [adventureId, t])

  const hasChanges = useMemo(() => {
    return !areAdventuresEqual(form, savedAdventure)
  }, [form, savedAdventure])

  useEffect(() => {
    const prompt = form.prompt.trim()

    if (!prompt) {
      setPromptTokenCount(0)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      const updateTokenCount = async () => {
        try {
          const result = await countGeminiTokens({
            instructions: adventureInstructions,
            prompt,
          })
          if (!cancelled) {
            setPromptTokenCount(result.totalTokens)
          }
        } catch {
          if (!cancelled) {
            setPromptTokenCount(null)
          }
        }
      }

      void updateTokenCount()
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [form.prompt])

  const handleFieldChange: AdventureEditPageState['handleFieldChange'] = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit: AdventureEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const adventure = await saveAdventure(adventureId, form)
      const nextAdventure: AdventureData = {
        uniqueId: adventure.uniqueId,
        name: adventure.name,
        prompt: adventure.prompt,
        output: adventure.output,
      }
      setForm(nextAdventure)
      setSavedAdventure(nextAdventure)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const handleBackToListClick = () => {
    handleTabChange('adventures')
    navigate('/')
  }

  const handleSendClick = () => {
    const sendPrompt = async () => {
      const prompt = form.prompt.trim()

      if (!prompt) {
        return
      }

      setSaving(true)
      setError('')

      try {
        const result = await createGeminiResponse({
          instructions: adventureInstructions,
          prompt,
        })
        const nextTodayRequestCount = todayRequestCount + 1
        const nextAdventure: AdventureData = {
          ...form,
          output: result.text,
        }
        const adventure = await saveAdventure(adventureId, nextAdventure)
        const savedData: AdventureData = {
          uniqueId: adventure.uniqueId,
          name: adventure.name,
          prompt: adventure.prompt,
          output: adventure.output,
        }
        setForm(savedData)
        setSavedAdventure(savedData)
        setLastUsage(result.usage)
        setTodayRequestCount(nextTodayRequestCount)
        saveTodayRequestCount(nextTodayRequestCount)
      } catch (nextError) {
        setError(getErrorMessage(t, nextError))
      } finally {
        setSaving(false)
      }
    }

    void sendPrompt()
  }

  return {
    error,
    form,
    handleBackToListClick,
    handleFieldChange,
    handleSendClick,
    handleSubmit,
    hasChanges,
    lastUsageLabel: lastUsage
      ? t('pages.adventureEdit.tokens.lastUsage', {
        input: lastUsage.inputTokens,
        output: lastUsage.outputTokens,
        total: lastUsage.totalTokens,
      })
      : t('pages.adventureEdit.tokens.noLastUsage'),
    loading,
    promptTokenLabel: promptTokenCount === null
      ? t('pages.adventureEdit.tokens.promptUnavailable')
      : t('pages.adventureEdit.tokens.promptCount', { count: promptTokenCount }),
    quotaResetLabel: t('pages.adventureEdit.tokens.quotaReset'),
    saving,
    todayRequestsLabel: t('pages.adventureEdit.tokens.todayRequests', { count: todayRequestCount }),
  }
}
