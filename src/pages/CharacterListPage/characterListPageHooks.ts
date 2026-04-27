import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCharacter, deleteCharacter, listCharacters } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { Character } from '../../types/character'
import type { CharacterListCardViewModel } from './types'

export function useCharacterListData(t: (key: string) => string) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
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

  return {
    characters,
    error,
    loading,
    setCharacters,
    setError,
  }
}

export function useCharacterListActions(
  t: (key: string) => string,
  setCharacters: Dispatch<SetStateAction<Character[]>>,
  setError: Dispatch<SetStateAction<string>>,
) {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)

  function openCharacter(characterId: string) {
    navigate(`/characters/${characterId}/edit`)
  }

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
    characterToDelete,
    creating,
    deletingId,
    handleCloseDeleteDialog,
    handleConfirmDeleteCharacter,
    handleCreateCharacter,
    handleOpenDeleteDialog,
    openCharacter,
  }
}

export function useCharacterListCards(
  characters: Character[],
  deletingId: string,
  openCharacter: (characterId: string) => void,
  handleOpenDeleteDialog: (character: Character) => void,
): CharacterListCardViewModel[] {
  const {
    getAlignmentLabel,
    getCharacterClassSrc,
    getCharacterLabel,
    getCharacterPortraitSrc,
    getClassLabel,
    getGenderLabel,
    getRaceLabel,
  } = useCharacterPresentation()

  return characters.map((character) => ({
    id: character.id,
    alignmentLabel: getAlignmentLabel(character.alignment),
    classLabel: getClassLabel(character.class),
    deleting: deletingId === character.id,
    genderLabel: getGenderLabel(character.gender),
    label: getCharacterLabel(character.name),
    level: character.level,
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteDialog(character)
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openCharacter(character.id)
      }
    },
    onOpen: () => {
      openCharacter(character.id)
    },
    portraitSrc: getCharacterPortraitSrc(character.race, character.gender),
    raceLabel: getRaceLabel(character.race),
    classSrc: getCharacterClassSrc(character.class),
  }))
}

export function useCharacterCardImageError() {
  function handleCardImageError(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.src = '/unnamed.png'
  }

  return handleCardImageError
}

export function useCharacterDialogLabel(character: Character | null) {
  const { getCharacterLabel } = useCharacterPresentation()

  return getCharacterLabel(character?.name)
}
