import type { AttributeDefinition, SkillDefinition } from './types'
import { CharacterClass, CharacterRace } from '../types/character'

export const attributeDefinitions: AttributeDefinition[] = [
  { key: 'strength', translationKey: 'pages.characterEdit.fields.strength' },
  { key: 'constitution', translationKey: 'pages.characterEdit.fields.constitution' },
  { key: 'dexterity', translationKey: 'pages.characterEdit.fields.dexterity' },
  { key: 'intelligence', translationKey: 'pages.characterEdit.fields.intelligence' },
  { key: 'wisdom', translationKey: 'pages.characterEdit.fields.wisdom' },
  { key: 'charisma', translationKey: 'pages.characterEdit.fields.charisma' },
]

export const trainingDefinitions: SkillDefinition[] = [
  {
    key: 'acrobatics',
    attributeKey: 'dexterity',
    translationKey: 'pages.characterEdit.fields.acrobatics',
  },
  {
    key: 'arcana',
    attributeKey: 'intelligence',
    translationKey: 'pages.characterEdit.fields.arcana',
  },
  {
    key: 'athletics',
    attributeKey: 'strength',
    translationKey: 'pages.characterEdit.fields.athletics',
  },
  {
    key: 'diplomacy',
    attributeKey: 'charisma',
    translationKey: 'pages.characterEdit.fields.diplomacy',
  },
  {
    key: 'history',
    attributeKey: 'intelligence',
    translationKey: 'pages.characterEdit.fields.history',
  },
  {
    key: 'healing',
    attributeKey: 'wisdom',
    translationKey: 'pages.characterEdit.fields.healing',
  },
  {
    key: 'deception',
    attributeKey: 'charisma',
    translationKey: 'pages.characterEdit.fields.deception',
  },
  {
    key: 'perception',
    attributeKey: 'wisdom',
    translationKey: 'pages.characterEdit.fields.perception',
  },
  {
    key: 'endurance',
    attributeKey: 'constitution',
    translationKey: 'pages.characterEdit.fields.endurance',
  },
  {
    key: 'dungeoneering',
    attributeKey: 'intelligence',
    translationKey: 'pages.characterEdit.fields.dungeoneering',
  },
  {
    key: 'nature',
    attributeKey: 'wisdom',
    translationKey: 'pages.characterEdit.fields.nature',
  },
  {
    key: 'religion',
    attributeKey: 'intelligence',
    translationKey: 'pages.characterEdit.fields.religion',
  },
  {
    key: 'insight',
    attributeKey: 'charisma',
    translationKey: 'pages.characterEdit.fields.insight',
  },
  {
    key: 'stealth',
    attributeKey: 'dexterity',
    translationKey: 'pages.characterEdit.fields.stealth',
  },
  {
    key: 'streetwise',
    attributeKey: 'wisdom',
    translationKey: 'pages.characterEdit.fields.streetwise',
  },
  {
    key: 'intimidation',
    attributeKey: 'charisma',
    translationKey: 'pages.characterEdit.fields.intimidation',
  },
  {
    key: 'thievery',
    attributeKey: 'dexterity',
    translationKey: 'pages.characterEdit.fields.thievery',
  },
]

export const raceOptions: CharacterRace[] = [
  CharacterRace.Human,
  CharacterRace.Tiefling,
  CharacterRace.Dragonborn,
  CharacterRace.Eladrin,
  CharacterRace.Elf,
  CharacterRace.Dwarf,
  CharacterRace.Halfling,
  CharacterRace.HalfElf,
]

export const classOptions: CharacterClass[] = [
  CharacterClass.Warlock,
  CharacterClass.Wizard,
  CharacterClass.Warlord,
  CharacterClass.Bard,
  CharacterClass.Cleric,
  CharacterClass.Rogue,
  CharacterClass.Ranger,
  CharacterClass.Paladin,
  CharacterClass.Fighter,
  CharacterClass.Barbarian,
]
