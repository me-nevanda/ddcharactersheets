import type { ContextAreaSnapshot, ContextCharacterGroupSnapshot, ContextData, ContextMonsterGroupSnapshot, ContextNpcGroupSnapshot } from '@appTypes/context'

export const emptyContextForm: ContextData = {
  name: '',
  description: '',
  characters: [],
  characterGroups: [],
  events: [],
  npcGroups: [],
  monsterGroups: [],
  areas: [],
}

export const buildPlainTextPreview = (value: string): string => {
  if (!value) {
    return ''
  }
  if (typeof document === 'undefined') {
    return value.replace(/\s+/g, ' ').trim()
  }
  const template = document.createElement('template')
  template.innerHTML = value
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export const areStringArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }
  return true
}

export const areNpcGroupSnapshotsEqual = (
  left: ContextNpcGroupSnapshot[],
  right: ContextNpcGroupSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.npcIds, b.npcIds)) {
      return false
    }
  }
  return true
}

export const areCharacterGroupSnapshotsEqual = (
  left: ContextCharacterGroupSnapshot[],
  right: ContextCharacterGroupSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.characterIds, b.characterIds)) {
      return false
    }
  }
  return true
}

export const areMonsterGroupSnapshotsEqual = (
  left: ContextMonsterGroupSnapshot[],
  right: ContextMonsterGroupSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.monsterIds, b.monsterIds)) {
      return false
    }
  }
  return true
}

export const areAreaSnapshotsEqual = (
  left: ContextAreaSnapshot[],
  right: ContextAreaSnapshot[],
): boolean => {
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a.id !== b.id || a.name !== b.name) {
      return false
    }
    if (!areStringArraysEqual(a.placeIds, b.placeIds)) {
      return false
    }
  }
  return true
}
