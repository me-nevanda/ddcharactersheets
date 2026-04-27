import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCharacter, deleteCharacter, listCharacters } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import {
  CharacterAlignment,
  CharacterClass,
  CharacterGender,
  CharacterRace,
} from '../../types/character'
import type { Character } from '../../types/character'
import type { CharacterListCardViewModel } from './types'

const raceKeyByCharacterRace: Record<CharacterRace, string> = {
  [CharacterRace.Human]: 'human',
  [CharacterRace.Tiefling]: 'thiefling',
  [CharacterRace.Dragonborn]: 'dracon',
  [CharacterRace.Eladrin]: 'eladrin',
  [CharacterRace.Elf]: 'elf',
  [CharacterRace.Dwarf]: 'dwarf',
  [CharacterRace.Halfling]: 'halfing',
  [CharacterRace.HalfElf]: 'halfelf',
}

const classImageByCharacterClass: Record<CharacterClass, string> = {
  [CharacterClass.Barbarian]: '/barbarian.png',
  [CharacterClass.Bard]: '/bard.png',
  [CharacterClass.Cleric]: '/cleric.png',
  [CharacterClass.Fighter]: '/fighter.png',
  [CharacterClass.Paladin]: '/paladin.png',
  [CharacterClass.Ranger]: '/ranger.png',
  [CharacterClass.Rogue]: '/rogue.png',
  [CharacterClass.Warlock]: '/warlock.png',
  [CharacterClass.Warlord]: '/warlord.png',
  [CharacterClass.Wizard]: '/wizard.png',
}

function getCharacterLabel(character: Character | null, t: (key: string) => string): string {
  return character?.name || t('pages.characterList.unnamedCharacter')
}

function getRaceLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterRace).includes(character.race)) {
    return t('pages.characterList.missingRace')
  }

  return t(`pages.characterEdit.options.race.${character.race}`)
}

function getClassLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterClass).includes(character.class)) {
    return t('pages.characterList.missingClass')
  }

  return t(`pages.characterEdit.options.class.${character.class}`)
}

function getGenderLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterGender).includes(character.gender)) {
    return t('pages.characterEdit.options.gender.unspecified')
  }

  return t(`pages.characterEdit.options.gender.${character.gender}`)
}

function getAlignmentLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterAlignment).includes(character.alignment)) {
    return t('pages.characterEdit.options.alignment.trueNeutral')
  }

  return t(`pages.characterEdit.options.alignment.${character.alignment}`)
}

function getCharacterPortraitSrc(character: Character): string {
  const raceKey = raceKeyByCharacterRace[character.race] ?? raceKeyByCharacterRace[CharacterRace.Human]
  const genderKey = character.gender === CharacterGender.Female ? 'female' : 'male'

  return `/${raceKey}_${genderKey}.png`
}

function getCharacterClassSrc(character: Character): string {
  return classImageByCharacterClass[character.class] ?? '/unnamed.png'
}

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
  t: (key: string) => string,
): CharacterListCardViewModel[] {
  return characters.map((character) => ({
    id: character.id,
    alignmentLabel: getAlignmentLabel(character, t),
    classLabel: getClassLabel(character, t),
    deleting: deletingId === character.id,
    genderLabel: getGenderLabel(character, t),
    label: getCharacterLabel(character, t),
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
    portraitSrc: getCharacterPortraitSrc(character),
    raceLabel: getRaceLabel(character, t),
    classSrc: getCharacterClassSrc(character),
  }))
}

export function useCharacterCardImageError() {
  function handleCardImageError(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.src = '/unnamed.png'
  }

  return handleCardImageError
}

export function getCharacterDialogLabel(character: Character | null, t: (key: string) => string): string {
  return getCharacterLabel(character, t)
}
