import { useI18n } from '@i18n/index'
import {
  CharacterAlignment,
  CharacterClass,
  CharacterGender,
  CharacterRace,
} from '../types/character'

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

export function useCharacterPresentation() {
  const { t } = useI18n()

  function getCharacterLabel(name: string | null | undefined): string {
    return name || t('pages.characterList.unnamedCharacter')
  }

  function getRaceLabel(race: CharacterRace | string): string {
    if (!Object.values(CharacterRace).includes(race as CharacterRace)) {
      return t('pages.characterList.missingRace')
    }

    return t(`pages.characterEdit.options.race.${race}`)
  }

  function getClassLabel(characterClass: CharacterClass | string): string {
    if (!Object.values(CharacterClass).includes(characterClass as CharacterClass)) {
      return t('pages.characterList.missingClass')
    }

    return t(`pages.characterEdit.options.class.${characterClass}`)
  }

  function getGenderLabel(gender: CharacterGender | string): string {
    if (!Object.values(CharacterGender).includes(gender as CharacterGender)) {
      return t('pages.characterEdit.options.gender.unspecified')
    }

    return t(`pages.characterEdit.options.gender.${gender}`)
  }

  function getAlignmentLabel(alignment: CharacterAlignment | string): string {
    if (!Object.values(CharacterAlignment).includes(alignment as CharacterAlignment)) {
      return t('pages.characterEdit.options.alignment.trueNeutral')
    }

    return t(`pages.characterEdit.options.alignment.${alignment}`)
  }

  function getCharacterPortraitSrc(race: CharacterRace | string, gender: CharacterGender | string): string {
    const raceKey = raceKeyByCharacterRace[race as CharacterRace] ?? raceKeyByCharacterRace[CharacterRace.Human]
    const genderKey = gender === CharacterGender.Female ? 'female' : 'male'

    return `/${raceKey}_${genderKey}.png`
  }

  function getCharacterClassSrc(characterClass: CharacterClass | string): string {
    return classImageByCharacterClass[characterClass as CharacterClass] ?? '/unnamed.png'
  }

  return {
    getAlignmentLabel,
    getCharacterClassSrc,
    getCharacterLabel,
    getCharacterPortraitSrc,
    getClassLabel,
    getGenderLabel,
    getRaceLabel,
  }
}
