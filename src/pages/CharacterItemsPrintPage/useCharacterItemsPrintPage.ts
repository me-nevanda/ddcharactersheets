import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useI18n } from '@i18n/index'
import { type Character } from '../../types/character'
import type { CharacterItemsPrintPageState, PrintItemRow } from './types'

function buildItemRows(
  items: Array<{ name: string; description: string }>,
  category: PrintItemRow['category'],
): PrintItemRow[] {
  return items
    .filter((item) => item.name.trim().length > 0 || item.description.trim().length > 0)
    .map((item, index) => ({
      key: `${item.name.trim() || 'item'}-${index}`,
      name: item.name,
      description: item.description,
      category,
    }))
}

export function useCharacterItemsPrintPage(): CharacterItemsPrintPageState {
  const { t } = useI18n()
  const { characterId = '' } = useParams()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCharacter() {
      try {
        const nextCharacter = await getCharacter(characterId)

        if (!cancelled) {
          setCharacter(nextCharacter)
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

    void loadCharacter()

    return () => {
      cancelled = true
    }
  }, [characterId, t])

  useEffect(() => {
    if (!character) {
      return
    }

    document.title = `${t('pages.characterItemsPrint.title')} - ${character.name || t('pages.characterList.unnamedCharacter')}`
  }, [character, t])

  const computedState = useMemo<CharacterItemsPrintPageState>(() => {
    if (!character) {
      return {
        loading,
        error,
        character,
        title: t('pages.characterItemsPrint.title'),
        characterName: t('pages.characterList.unnamedCharacter'),
        hasItems: false,
        armors: [],
        weapons: [],
        others: [],
      }
    }

    const armors = buildItemRows(character.items.armors, 'armor')
    const weapons = buildItemRows(character.items.weapons, 'weapon')
    const others = buildItemRows(character.items.others, 'other')

    return {
      loading,
      error,
      character,
      title: t('pages.characterItemsPrint.title'),
      characterName: character.name || t('pages.characterList.unnamedCharacter'),
      hasItems: armors.length > 0 || weapons.length > 0 || others.length > 0,
      armors,
      weapons,
      others,
    }
  }, [character, error, loading, t])

  return computedState
}
