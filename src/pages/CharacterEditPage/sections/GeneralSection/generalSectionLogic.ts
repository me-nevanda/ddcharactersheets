import { CharacterClass, CharacterRace } from '../../../../types/character';
import type { CharacterAttributeBonuses } from '../../../../types/character';
export const clampLevelValue = (value: number): number => {
    return Math.min(30, Math.max(1, Math.trunc(value)));
};
export const clampSpeedValue = (value: number): number => {
    return Math.min(12, Math.max(1, Math.trunc(value)));
};
export const buildCharacterSpeed = (race: CharacterRace): number => {
    if (race === CharacterRace.Elf) {
        return 7;
    }
    if (race === CharacterRace.Dwarf) {
        return 5;
    }
    return 6;
};
export const getLevelBonus = (value: number): number => {
    return Math.floor(Math.min(30, Math.max(1, Math.trunc(value))) / 2);
};
export const formatModifier = (value: number): string => {
    if (value > 0) {
        return `+${value}`;
    }
    return String(value);
};
export const normalizeRaceValue = (value: string): CharacterRace => {
    if (Object.values(CharacterRace).includes(value as CharacterRace)) {
        return value as CharacterRace;
    }
    return CharacterRace.Human;
};
export const normalizeClassValue = (value: string): CharacterClass => {
    if (Object.values(CharacterClass).includes(value as CharacterClass)) {
        return value as CharacterClass;
    }
    return CharacterClass.Warlock;
};
export const buildRaceAttributeBonuses = (race: CharacterRace): CharacterAttributeBonuses => {
    return {
        strength: race === CharacterRace.Dragonborn ? 2 : 0,
        condition: race === CharacterRace.Dwarf || race === CharacterRace.HalfElf ? 2 : 0,
        dexterity: race === CharacterRace.Eladrin || race === CharacterRace.Elf || race === CharacterRace.Halfling ? 2 : 0,
        intelligence: race === CharacterRace.Tiefling || race === CharacterRace.Eladrin ? 2 : 0,
        wisdom: race === CharacterRace.Elf || race === CharacterRace.Dwarf ? 2 : 0,
        charisma: race === CharacterRace.Tiefling ||
            race === CharacterRace.Dragonborn ||
            race === CharacterRace.Halfling ||
            race === CharacterRace.HalfElf
            ? 2
            : 0,
    };
};
export const buildCharacterHp = (characterClass: CharacterClass, level: number, condition: number): number => {
    if (characterClass === CharacterClass.Warlock || characterClass === CharacterClass.Rogue || characterClass === CharacterClass.Ranger) {
        return 7 + condition + 5 * level;
    }
    if (characterClass === CharacterClass.Wizard) {
        return 6 + condition + 4 * level;
    }
    if (characterClass === CharacterClass.Paladin || characterClass === CharacterClass.Fighter || characterClass === CharacterClass.Barbarian) {
        return 9 + condition + 6 * level;
    }
    if (characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard || characterClass === CharacterClass.Cleric) {
        return 7 + condition + 5 * level;
    }
    return 0;
};
export const buildCharacterSurge = (characterClass: CharacterClass, conditionBonus: number): number => {
    if (characterClass === CharacterClass.Warlock || characterClass === CharacterClass.Rogue || characterClass === CharacterClass.Ranger) {
        return 6 + conditionBonus;
    }
    if (characterClass === CharacterClass.Wizard) {
        return 6 + conditionBonus;
    }
    if (characterClass === CharacterClass.Paladin || characterClass === CharacterClass.Fighter || characterClass === CharacterClass.Barbarian) {
        return 10 + conditionBonus;
    }
    if (characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard || characterClass === CharacterClass.Cleric) {
        return 7 + conditionBonus;
    }
    return 0;
};
