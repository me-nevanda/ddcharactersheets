import { useEffect, useState, type SyntheticEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCharacterGroup, listCharacters, saveCharacterGroup } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import { useI18n } from '@i18n/index'
import type { Character, CharacterGroup } from '@appTypes/character'
import type { AssignedCharacterGroupCharacterViewModel, CharacterGroupCharacterOptionViewModel, CharacterGroupCharacterViewModel, CharacterGroupEditPageState } from './types'

const emptyGroup: CharacterGroup = {
  id: '',
  uniqueId: '',
  name: '',
  characterFileNames: [],
  updatedAt: '',
}

const getCharacterFileName = (characterId: string): string => {
  return `${characterId}.json`
}

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildCharacterViewModel = (
  character: Character,
  presentation: ReturnType<typeof useCharacterPresentation>,
  openCharacter: (characterId: string) => void,
  handleImageError: (event: SyntheticEvent<HTMLImageElement>) => void,
): CharacterGroupCharacterViewModel => {
  return {
    classLabel: presentation.getClassLabel(character.class),
    classSrc: presentation.getCharacterClassSrc(character.class),
    descriptionPreview: buildTextPreview(character.description),
    fileName: getCharacterFileName(character.id),
    id: character.id,
    imageSrc: character.imageUrl,
    label: presentation.getCharacterLabel(character.name),
    level: character.level,
    onImageError: handleImageError,
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openCharacter(character.id)
      }
    },
    onOpen: () => {
      openCharacter(character.id)
    },
    portraitSrc: presentation.getCharacterPortraitSrc(character.race, character.gender),
    raceLabel: presentation.getRaceLabel(character.race),
  }
}

export const useCharacterGroupEditPage = (): CharacterGroupEditPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const presentation = useCharacterPresentation()
  const { groupId = '' } = useParams()
  const [form, setForm] = useState<CharacterGroup>(emptyGroup)
  const [initialForm, setInitialForm] = useState<CharacterGroup>(emptyGroup)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const [assignedCharacterSearch, setAssignedCharacterSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGroup = async () => {
      try {
        const [nextGroup, nextCharacters] = await Promise.all([
          getCharacterGroup(groupId),
          listCharacters(),
        ])

        if (!cancelled) {
          setForm(nextGroup)
          setInitialForm(nextGroup)
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

    void loadGroup()

    return () => {
      cancelled = true
    }
  }, [groupId, t])

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/unnamed.png'
  }

  const handleChangeGroupName = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
    }))
  }

  const handleChangeCharacterSearch = (value: string) => {
    setCharacterSearch(value)
  }

  const handleChangeAssignedCharacterSearch = (value: string) => {
    setAssignedCharacterSearch(value)
  }

  const handleAddCharacter = (characterId: string) => {
    const fileName = getCharacterFileName(characterId)
    setForm((current) => {
      if (current.characterFileNames.includes(fileName)) {
        return current
      }

      return {
        ...current,
        characterFileNames: [...current.characterFileNames, fileName],
      }
    })
  }

  const handleRemoveCharacter = (characterId: string) => {
    const fileName = getCharacterFileName(characterId)
    setForm((current) => ({
      ...current,
      characterFileNames: current.characterFileNames.filter((currentFileName) => currentFileName !== fileName),
    }))
  }

  const handleSubmit: CharacterGroupEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const savedGroup = await saveCharacterGroup(groupId, {
        ...form,
        name: form.name.trim(),
      })
      setForm(savedGroup)
      setInitialForm(savedGroup)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const openCharacter = (characterId: string) => {
    navigate(`/characters/${characterId}/edit`)
  }

  const assignedCharacterFileNames = new Set(form.characterFileNames)
  const normalizedAssignedCharacterSearch = assignedCharacterSearch.trim().toLocaleLowerCase()
  const allAssignedCharacters: AssignedCharacterGroupCharacterViewModel[] = form.characterFileNames
    .map((fileName) => characters.find((character) => getCharacterFileName(character.id) === fileName))
    .filter((character): character is Character => Boolean(character))
    .map((character) => ({
      ...buildCharacterViewModel(character, presentation, openCharacter, handleImageError),
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveCharacter(character.id)
      },
    }))
  const assignedCharacters = normalizedAssignedCharacterSearch.length >= 3
    ? allAssignedCharacters.filter((character) => character.label.toLocaleLowerCase().includes(normalizedAssignedCharacterSearch))
    : allAssignedCharacters

  const normalizedCharacterSearch = characterSearch.trim().toLocaleLowerCase()
  const availableCharacters = characters.filter((character) => !assignedCharacterFileNames.has(getCharacterFileName(character.id)))
  const filteredCharacters = normalizedCharacterSearch.length >= 3
    ? availableCharacters.filter((character) => presentation.getCharacterLabel(character.name).toLocaleLowerCase().includes(normalizedCharacterSearch))
    : availableCharacters.slice(0, 8)
  const characterOptions: CharacterGroupCharacterOptionViewModel[] = filteredCharacters.map((character) => ({
    ...buildCharacterViewModel(character, presentation, openCharacter, handleImageError),
    onAddClick: (event) => {
      event.stopPropagation()
      handleAddCharacter(character.id)
    },
  }))

  return {
    assignedCharacters,
    assignedCharacterSearch,
    characterOptions,
    characterSearch,
    error,
    groupName: form.name,
    handleChangeAssignedCharacterSearch,
    handleChangeCharacterSearch,
    handleChangeGroupName,
    handleSubmit,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    loading,
    saving,
  }
}
