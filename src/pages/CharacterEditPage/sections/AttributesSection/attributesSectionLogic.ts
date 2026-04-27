import { attributeDefinitions } from '@dictionaries/characterEditDefinitions';
import type { CharacterAttributeBonuses, CharacterAttributes } from '../../../../types/character';
import type { AttributeRow } from '../../types';
export const clampAttributeValue = (value: number): number => {
    return Math.min(40, Math.max(0, Math.trunc(value)));
};
export const getAttributeModifier = (value: number): number => {
    return Math.floor((Math.min(40, Math.max(0, Math.trunc(value))) - 10) / 2);
};
export const buildNormalizedAttributes = (attributes: CharacterAttributes): CharacterAttributes => {
    return attributeDefinitions.reduce((acc, { key }) => {
        acc[key] = clampAttributeValue(attributes[key]);
        return acc;
    }, {} as CharacterAttributes);
};
export const buildEffectiveAttributes = (attributes: CharacterAttributes, attributeBonuses: CharacterAttributeBonuses): CharacterAttributes => {
    return attributeDefinitions.reduce((acc, { key }) => {
        acc[key] = clampAttributeValue(attributes[key] + attributeBonuses[key]);
        return acc;
    }, {} as CharacterAttributes);
};
export const buildAttributeModifierMap = (attributes: CharacterAttributes): CharacterAttributeBonuses => {
    return attributeDefinitions.reduce((acc, { key }) => {
        acc[key] = getAttributeModifier(attributes[key]);
        return acc;
    }, {} as CharacterAttributeBonuses);
};
export const buildAttributeRows = (attributes: CharacterAttributes, attributeModifiers: CharacterAttributeBonuses): AttributeRow[] => {
    return attributeDefinitions.map(({ key }) => ({
        key,
        value: attributes[key],
        modifierLabel: formatModifier(attributeModifiers[key]),
    }));
};
const formatModifier = (value: number): string => {
    if (value > 0) {
        return `+${value}`;
    }
    return String(value);
};
