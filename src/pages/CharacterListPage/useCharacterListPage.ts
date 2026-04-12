import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCharacter, deleteCharacter, listCharacters } from '@lib/api'
import { useI18n } from '@i18n/index'
import { getErrorMessage } from '@lib/errors'
import type { Character } from '../../types/character'
import type { CharacterListPageState } from './types'

export function useCharacterListPage(): CharacterListPageState {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCharacters() {
      try {
        const nextCharacters = await listCharacters()

        if (!cancelled) {
          setCharacters(nextCharacters)
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

    void loadCharacters()

    return () => {
      cancelled = true
    }
  }, [t])

  async function handleCreateCharacter() {
    setCreating(true)
    setError('')

    try {
      const character = await createCharacter()
      navigate(`/characters/${character.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  function handleOpenDeleteDialog(character: Character) {
    setCharacterToDelete(character)
  }

  function handleCloseDeleteDialog() {
    setCharacterToDelete(null)
  }

  async function handleConfirmDeleteCharacter() {
    if (!characterToDelete) {
      return
    }

    setDeletingId(characterToDelete.id)
    setError('')

    try {
      await deleteCharacter(characterToDelete.id)
      setCharacters((currentCharacters) =>
        currentCharacters.filter((item) => item.id !== characterToDelete.id),
      )
      setCharacterToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  return {
    characters,
    creating,
    deletingId,
    error,
    loading,
    characterToDelete,
    handleCloseDeleteDialog,
    handleConfirmDeleteCharacter,
    handleCreateCharacter,
    handleOpenDeleteDialog,
  }
}
