import { useEffect } from 'react';
import { getCharacter } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import type { TranslationVariables } from '@i18n/types';
import { emptyAbilities, emptyFeats, emptyForm, defaultAbilityAction, defaultAbilityKind, defaultAbilityWeaponDamageDiceCount, defaultAbilityWeaponDamageDiceType, defaultAbilityWeaponDamageType, defaultAbilityWeaponRecurringDamageCount, defaultAbilityWeaponRecurringDamageType, zeroAttributeBonuses, zeroDefenses, zeroDefenseBonuses, } from '@pages/CharacterEditPage/characterEditPageUtils';
import { normalizeAbilityType, normalizeAbilityWeaponArea, normalizeAbilityWeaponAttackAttribute, normalizeAbilityWeaponAttackBonusNumber, normalizeAbilityWeaponAttackDefense, normalizeAbilityWeaponDamageDiceCount, normalizeAbilityWeaponDamageDiceType, normalizeAbilityWeaponDamageType, normalizeAbilityWeaponRange, normalizeAbilityWeaponRecurringDamageCount, normalizeFeats, normalizeItems, } from '../characterEditPageLogic';
import { buildNormalizedAttributes } from '../sections/AttributesSection/attributesSectionHooks';
import { buildRaceAttributeBonuses, buildCharacterSpeed, clampLevelValue } from '../sections/GeneralSection/generalSectionHooks';
import type { Character, CharacterWeapon } from '@appTypes/character';
import type { CharacterEditFormData, CharacterEditPageSetBoolean, CharacterEditPageSetForm, CharacterEditPageSetString } from '../types';

const resolveAbilityWeaponId = (weaponReference: string, weapons: CharacterWeapon[]): string => {
    if (weaponReference.length === 0) {
        return '';
    }
    const weaponById = weapons.find((weapon) => weapon.id === weaponReference);
    if (weaponById) {
        return weaponById.id;
    }
    const normalizedWeaponReference = weaponReference.trim().toLowerCase();
    const weaponByName = weapons.find((weapon) => weapon.name.trim().toLowerCase() === normalizedWeaponReference);
    return weaponByName?.id ?? weaponReference;
};

const buildCharacterEditFormData = (character: Character): CharacterEditFormData => {
    const { bonuses: characterBonuses, ...characterData } = character;
    const items = normalizeItems(character.items);
    return {
        ...characterData,
        description: character.description ?? '',
        level: clampLevelValue(character.level),
        speed: buildCharacterSpeed(character.race),
        hp: character.hp ?? 0,
        surge: character.surge ?? 0,
        attributes: buildNormalizedAttributes(character.attributes),
        attributesPlus: buildRaceAttributeBonuses(character.race),
        abilities: (character.abilities ?? emptyAbilities).map((ability) => ({
            ...ability,
            id: ability.id || globalThis.crypto.randomUUID(),
            action: ability.action ?? defaultAbilityAction,
            type: normalizeAbilityType(ability.type),
            kind: ability.kind ?? defaultAbilityKind,
            weaponCount: ability.weaponCount ?? 1,
            weaponId: resolveAbilityWeaponId(ability.weaponId ?? (ability as { weaponName?: string }).weaponName ?? '', items.weapons),
            weaponDamageDiceType: normalizeAbilityWeaponDamageDiceType(ability.weaponDamageDiceType, defaultAbilityWeaponDamageDiceType),
            weaponDamageDiceCount: normalizeAbilityWeaponDamageDiceCount(ability.weaponDamageDiceCount, defaultAbilityWeaponDamageDiceCount),
            weaponAttributeBonus: ability.weaponAttributeBonus ?? '',
            weaponAttackAttribute: normalizeAbilityWeaponAttackAttribute(ability.weaponAttackAttribute),
            weaponAttackDefense: normalizeAbilityWeaponAttackDefense(ability.weaponAttackDefense),
            weaponDamageType: normalizeAbilityWeaponDamageType(ability.weaponDamageType, defaultAbilityWeaponDamageType),
            weaponAttackBonusNumber: normalizeAbilityWeaponAttackBonusNumber(ability.weaponAttackBonusNumber),
            weaponRecurringDamageCount: normalizeAbilityWeaponRecurringDamageCount(ability.weaponRecurringDamageCount, defaultAbilityWeaponRecurringDamageCount),
            weaponRecurringDamageType: normalizeAbilityWeaponDamageType(ability.weaponRecurringDamageType, defaultAbilityWeaponRecurringDamageType),
            weaponHit: ability.weaponHit ?? '',
            weaponMiss: ability.weaponMiss ?? '',
            weaponProvocation: ability.weaponProvocation ?? '',
            weaponRange: normalizeAbilityWeaponRange(ability.weaponRange),
            weaponArea: normalizeAbilityWeaponArea(ability.weaponArea),
        })),
        feats: normalizeFeats(character.feats ?? emptyFeats),
        items,
        defenses: character.defenses ?? zeroDefenses,
        training: {
            ...character.training,
            endurance: character.training.endurance ?? false,
        },
        bonuses: {
            level: characterBonuses?.level ?? 0,
            attributes: characterBonuses?.attributes ?? zeroAttributeBonuses,
            skills: characterBonuses?.skills ?? emptyForm.bonuses.skills,
            defenses: characterBonuses?.defenses ?? zeroDefenseBonuses,
        },
    };
};

export const useCharacterEditPageLoad = (
    characterId: string,
    setForm: CharacterEditPageSetForm,
    setInitialForm: CharacterEditPageSetForm,
    setError: CharacterEditPageSetString,
    setImageUrl: CharacterEditPageSetString,
    setLoading: CharacterEditPageSetBoolean,
    t: (key: string, variables?: TranslationVariables) => string,
) => {
    useEffect(() => {
        let cancelled = false;
        const loadCharacter = async () => {
            try {
                const character = await getCharacter(characterId);
                if (!cancelled) {
                    const nextForm = buildCharacterEditFormData(character);
                    setForm(nextForm);
                    setInitialForm(nextForm);
                    setImageUrl(character.imageUrl);
                    setError('');
                }
            }
            catch (nextError) {
                if (!cancelled) {
                    setError(getErrorMessage(t, nextError));
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        void loadCharacter();
        return () => {
            cancelled = true;
        };
    }, [characterId, setError, setForm, setImageUrl, setInitialForm, setLoading, t]);
};
