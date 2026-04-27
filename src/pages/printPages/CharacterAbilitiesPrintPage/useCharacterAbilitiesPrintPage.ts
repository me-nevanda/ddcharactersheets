import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '@i18n/index';
import { useCharacterById, useCharacterDocumentTitle } from '@pages/characterPageHooks';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import { type Character, type CharacterAbility, type CharacterAttributeBonuses } from '../../../types/character';
import { buildAttributeModifierMap, buildEffectiveAttributes, buildNormalizedAttributes, } from '@pages/CharacterEditPage/sections/AttributesSection/attributesSectionLogic';
import { formatModifier } from '@pages/CharacterEditPage/sections/GeneralSection/generalSectionLogic';
import type { CharacterAbilitiesPrintPageState, PrintAbilityDetailRow, PrintAbilityRow, PrintFeatRow } from './types';
const buildAbilityMeta = (t: ReturnType<typeof useI18n>['t'], ability: CharacterAbility): string[] => {
    return [
        t(`pages.characterEdit.abilities.actionOptions.${ability.action}`),
        t(`pages.characterEdit.abilities.kindOptions.${ability.kind}`),
    ];
};
const buildAttackAttributeLabel = (t: ReturnType<typeof useI18n>['t'], attribute: CharacterAbility['weaponAttackAttribute'], attributeModifierLookup: CharacterAttributeBonuses, levelBonus: number, attackBonus: number): string => {
    if (!attribute) {
        return '';
    }
    const labelMap: Record<keyof CharacterAttributeBonuses, string> = {
        strength: t('pages.characterEdit.fields.strength'),
        condition: t('pages.characterEdit.fields.condition'),
        dexterity: t('pages.characterEdit.fields.dexterity'),
        intelligence: t('pages.characterEdit.fields.intelligence'),
        wisdom: t('pages.characterEdit.fields.wisdom'),
        charisma: t('pages.characterEdit.fields.charisma'),
    };
    return `${labelMap[attribute]} (${formatModifier((attributeModifierLookup[attribute] ?? 0) + levelBonus + attackBonus)})`;
};
const buildDefenseLabel = (t: ReturnType<typeof useI18n>['t'], defense: CharacterAbility['weaponAttackDefense']): string => {
    switch (defense) {
        case 'kp':
            return t('pages.characterEdit.fields.kp');
        case 'fortitude':
            return t('pages.characterEdit.fields.fortitude');
        case 'reflex':
            return t('pages.characterEdit.fields.reflex');
        case 'will':
            return t('pages.characterEdit.fields.will');
        default:
            return '';
    }
};
const buildAttackDisplayLabel = (t: ReturnType<typeof useI18n>['t'], ability: CharacterAbility, character: CharacterAbilitiesPrintPageState['character']): string => {
    if (!character) {
        return '';
    }
    const attributeModifierLookup = buildAttributeModifierLookup(character);
    const attackAttributeLabel = buildAttackAttributeLabel(t, ability.weaponAttackAttribute, attributeModifierLookup, character.bonuses?.level ?? 0, ability.weaponAttackBonusNumber);
    const attackDefenseLabel = buildDefenseLabel(t, ability.weaponAttackDefense);
    if (!attackAttributeLabel || !attackDefenseLabel) {
        return '';
    }
    return `${attackAttributeLabel} ${t('pages.characterEdit.abilities.weaponAgainstLabel')} ${attackDefenseLabel}`;
};
const buildDamageTypeLabel = (t: ReturnType<typeof useI18n>['t'], damageType: CharacterAbility['weaponDamageType']): string => {
    switch (damageType) {
        case 'normal':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.normal');
        case 'acid':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.acid');
        case 'cold':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.cold');
        case 'fire':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.fire');
        case 'force':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.force');
        case 'lightning':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.lightning');
        case 'necrotic':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.necrotic');
        case 'poison':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.poison');
        case 'psychic':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.psychic');
        case 'radiant':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.radiant');
        case 'thunder':
            return t('pages.characterEdit.abilities.weaponDamageTypeOptions.thunder');
        default:
            return '';
    }
};
const buildDamageDiceLabel = (t: ReturnType<typeof useI18n>['t'], damageDiceType: CharacterAbility['weaponDamageDiceType']): string => {
    switch (damageDiceType) {
        case 'd4':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d4');
        case 'd6':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d6');
        case 'd8':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d8');
        case 'd10':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d10');
        case 'd12':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d12');
        case 'd20':
            return t('pages.characterEdit.abilities.weaponDamageDiceOptions.d20');
        default:
            return '';
    }
};
const buildWeaponDamageLabel = (t: ReturnType<typeof useI18n>['t'], weaponName: string, weapons: CharacterAbilitiesPrintPageState['character'] extends infer T ? T extends {
    items: {
        weapons: Array<infer U>;
    };
} ? Array<U> : never : never): string => {
    const normalizedWeaponName = weaponName.trim().toLowerCase();
    const weapon = weapons.find((entry) => entry.name.trim().toLowerCase() === normalizedWeaponName);
    if (!weapon) {
        return weaponName.trim();
    }
    const damageParts = [
        weapon.damageDiceType ? buildDamageDiceLabel(t, weapon.damageDiceType) : '',
        weapon.damageBonusNumber > 0 ? String(weapon.damageBonusNumber) : '',
    ].filter((part) => part.length > 0);
    return damageParts.join(' + ');
};
const buildAttributeModifierLookup = (character: Pick<Character, 'attributes' | 'attributesPlus' | 'bonuses'>): CharacterAttributeBonuses => {
    if (character.bonuses?.attributes) {
        return character.bonuses.attributes;
    }
    const normalizedAttributes = buildNormalizedAttributes(character.attributes);
    const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, character.attributesPlus);
    return buildAttributeModifierMap(effectiveAttributes);
};
const buildAbilityDamage = (t: ReturnType<typeof useI18n>['t'], ability: CharacterAbility, character: CharacterAbilitiesPrintPageState['character']): string => {
    if (!character) {
        return '';
    }
    const damageTypeLabel = buildDamageTypeLabel(t, ability.weaponDamageType);
    const attributeModifierLookup = buildAttributeModifierLookup(character);
    const levelBonusValue = character.bonuses?.level ?? 0;
    const attributeBonusValue = ability.weaponAttributeBonus
        ? (attributeModifierLookup[ability.weaponAttributeBonus as keyof CharacterAttributeBonuses] ?? 0) + levelBonusValue
        : 0;
    const damageCoreParts = [
        ability.weaponDamageDiceType ? buildDamageDiceLabel(t, ability.weaponDamageDiceType) : '',
        ability.weaponDamageDiceCount > 0 || attributeBonusValue !== 0
            ? [ability.weaponDamageDiceCount > 0 ? String(ability.weaponDamageDiceCount) : '', attributeBonusValue !== 0 ? String(attributeBonusValue) : '']
                .filter((part) => part.length > 0)
                .join(' + ')
            : '',
    ].filter((part) => part.length > 0);
    const recurringDamagePart = ability.weaponRecurringDamageCount > 0
        ? ability.weaponRecurringDamageType !== 'normal'
            ? `${ability.weaponRecurringDamageCount} ${t('pages.characterAbilitiesPrint.damageParts.recurring')} ${t('pages.characterAbilitiesPrint.damageParts.type')} ${buildDamageTypeLabel(t, ability.weaponRecurringDamageType)}`
            : `${ability.weaponRecurringDamageCount} ${t('pages.characterAbilitiesPrint.damageParts.recurring')}`
        : '';
    const damageParts = [
        ability.weaponName.trim().length > 0
            ? ability.weaponCount > 0
                ? `(${ability.weaponCount} x ${buildWeaponDamageLabel(t, ability.weaponName, character.items.weapons)})`
                : `(${buildWeaponDamageLabel(t, ability.weaponName, character.items.weapons)})`
            : '',
        damageCoreParts.join(' + '),
    ].filter((part) => part.length > 0);
    if (ability.weaponDamageType !== 'normal' && damageParts.length > 0) {
        const lastIndex = damageParts.length - 1;
        damageParts[lastIndex] = `${damageParts[lastIndex]} ${t('pages.characterAbilitiesPrint.damageParts.type')} ${damageTypeLabel}`;
    }
    const damageCore = damageParts.join(' + ');
    if (recurringDamagePart.length > 0) {
        return damageCore.length > 0 ? `${damageCore} (+ ${recurringDamagePart})` : recurringDamagePart;
    }
    return damageCore;
};
const buildAbilityAreaLabel = (t: ReturnType<typeof useI18n>['t'], area: CharacterAbility['weaponArea']): string => {
    if (area === 'point') {
        return t('pages.characterEdit.abilities.weaponAreaOptions.point');
    }
    const areaType = area.startsWith('burst') ? 'burst' : 'blast';
    const areaValue = Number.parseInt(area.slice(areaType.length), 10);
    if (Number.isFinite(areaValue)) {
        return `${t(`pages.characterEdit.abilities.weaponAreaOptions.${areaType}`)} ${areaValue}`;
    }
    return t('pages.characterEdit.abilities.weaponAreaOptions.point');
};
const buildAbilityDetails = (t: ReturnType<typeof useI18n>['t'], ability: CharacterAbility): PrintAbilityDetailRow[] => {
    return [
        {
            label: t('pages.characterEdit.abilities.weaponRangeLabel'),
            value: String(ability.weaponRange),
        },
        {
            label: t('pages.characterEdit.abilities.weaponAreaLabel'),
            value: buildAbilityAreaLabel(t, ability.weaponArea),
        },
    ];
};
const buildOffensiveNotes = (t: ReturnType<typeof useI18n>['t'], ability: CharacterAbility): PrintAbilityDetailRow[] => {
    return [
        ability.weaponProvocation.trim().length > 0
            ? {
                label: t('pages.characterEdit.abilities.weaponProvocationLabel'),
                value: ability.weaponProvocation,
            }
            : null,
        ability.weaponHit.trim().length > 0
            ? {
                label: t('pages.characterEdit.abilities.weaponHitLabel'),
                value: ability.weaponHit,
            }
            : null,
        ability.weaponMiss.trim().length > 0
            ? {
                label: t('pages.characterEdit.abilities.weaponMissLabel'),
                value: ability.weaponMiss,
            }
            : null,
    ].filter((row): row is PrintAbilityDetailRow => row !== null);
};
export const useCharacterAbilitiesPrintPage = (): CharacterAbilitiesPrintPageState => {
    const { t } = useI18n();
    const { getCharacterLabel } = useCharacterPresentation();
    const { characterId = '' } = useParams();
    const { character, loading, error } = useCharacterById(characterId, t);
    useCharacterDocumentTitle(t('pages.characterAbilitiesPrint.title'), character?.name);
    const computedState = useMemo<CharacterAbilitiesPrintPageState>(() => {
        if (!character) {
            return {
                loading,
                error,
                character,
                title: t('pages.characterAbilitiesPrint.title'),
                characterName: getCharacterLabel(null),
                abilityRows: [],
                featRows: [],
                abilityCount: 0,
                featCount: 0,
                hasAbilities: false,
                hasFeats: false,
            };
        }
        const abilityRows: PrintAbilityRow[] = (character.abilities ?? []).map((ability, index) => ({
            key: ability.id || `ability-${index}`,
            name: ability.name,
            description: ability.description,
            meta: buildAbilityMeta(t, ability),
            action: ability.action,
            type: ability.type,
            kind: ability.kind,
            weaponAttackAttribute: ability.weaponAttackAttribute,
            weaponAttackDefense: ability.weaponAttackDefense,
            weaponAttackDisplay: buildAttackDisplayLabel(t, ability, character),
            damage: buildAbilityDamage(t, ability, character),
            details: buildAbilityDetails(t, ability),
            offensiveNotes: buildOffensiveNotes(t, ability),
        }));
        const featRows: PrintFeatRow[] = (character.feats ?? [])
            .filter((feat) => feat.visible)
            .map((feat, index) => ({
            key: feat.id || `feat-${index}`,
            name: feat.name,
            description: feat.description,
        }));
        return {
            loading,
            error,
            character,
            title: t('pages.characterAbilitiesPrint.title'),
            characterName: getCharacterLabel(character.name),
            abilityRows,
            featRows,
            abilityCount: abilityRows.length,
            featCount: featRows.length,
            hasAbilities: abilityRows.length > 0,
            hasFeats: featRows.length > 0,
        };
    }, [character, error, getCharacterLabel, loading, t]);
    return computedState;
};
