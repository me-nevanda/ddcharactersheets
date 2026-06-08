import type { FormEvent } from 'react';
import { saveCharacter, saveCharacterHistory } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import type { TranslationVariables } from '@i18n/types';
import { defaultAbilityWeaponAttackAttribute, defaultAbilityWeaponAttackBonusNumber, defaultAbilityWeaponAttackDefense, defaultAbilityWeaponDamageDiceCount, defaultAbilityWeaponDamageDiceType, defaultAbilityWeaponDamageType, defaultAbilityWeaponHit, defaultAbilityWeaponMiss, defaultAbilityWeaponProvocation, defaultAbilityWeaponRecurringDamageCount, defaultAbilityWeaponRecurringDamageType, zeroDefenses } from '@pages/CharacterEditPage/characterEditPageUtils';
import { hasFeatContent, normalizeAlignmentValue, normalizeGenderValue } from '../characterEditPageLogic';
import { normalizeDefenses } from '../sections/DefensesSection/defensesSectionHooks';
import { buildCharacterSpeed, clampLevelValue } from '../sections/GeneralSection/generalSectionHooks';
import type { CharacterBonuses, CharacterHistoryEntry } from '@appTypes/character';
import type { CharacterEditFormData, CharacterEditPageComputedState, CharacterEditPageSetBoolean, CharacterEditPageSetForm, CharacterEditPageSetHistoryEntries, CharacterEditPageSetString } from '../types';

type UseCharacterEditPageSubmitHandlerParams = {
    characterId: string;
    computedState: CharacterEditPageComputedState;
    form: CharacterEditFormData;
    historyEntries: CharacterHistoryEntry[];
    setError: CharacterEditPageSetString;
    setHistoryEntries: CharacterEditPageSetHistoryEntries;
    setInitialForm: CharacterEditPageSetForm;
    setInitialHistoryEntries: CharacterEditPageSetHistoryEntries;
    setSaving: CharacterEditPageSetBoolean;
    t: (key: string, variables?: TranslationVariables) => string;
};

export const useCharacterEditPageSubmitHandler = ({
    characterId,
    computedState,
    form,
    historyEntries,
    setError,
    setHistoryEntries,
    setInitialForm,
    setInitialHistoryEntries,
    setSaving,
    t,
}: UseCharacterEditPageSubmitHandlerParams) => {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const bonuses: CharacterBonuses = {
                level: computedState.levelBonusValue,
                attributes: computedState.attributeModifierMap,
                skills: computedState.skillBonusesWithFeats,
                defenses: computedState.defenseValues,
            };
            await saveCharacter(characterId, {
                ...form,
                name: form.name.trim(),
                shortDescription: form.shortDescription.trim(),
                description: form.description.trim(),
                level: clampLevelValue(form.level),
                gender: normalizeGenderValue(form.gender),
                alignment: normalizeAlignmentValue(form.alignment),
                speed: buildCharacterSpeed(form.race),
                hp: computedState.hpValue,
                surge: computedState.surgeValue,
                attributes: computedState.normalizedAttributes,
                attributesPlus: form.attributesPlus,
                abilities: form.abilities.map((ability) => ability.kind === 'utility'
                    ? {
                        id: ability.id,
                        name: ability.name,
                        description: ability.description,
                        action: ability.action,
                        type: ability.type,
                        kind: ability.kind,
                        weaponCount: 1,
                        weaponId: '',
                        weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                        weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                        weaponAttributeBonus: '',
                        weaponAttackAttribute: defaultAbilityWeaponAttackAttribute,
                        weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                        weaponAttackDefense: defaultAbilityWeaponAttackDefense,
                        weaponDamageType: defaultAbilityWeaponDamageType,
                        weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                        weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                        weaponHit: defaultAbilityWeaponHit,
                        weaponMiss: defaultAbilityWeaponMiss,
                        weaponProvocation: defaultAbilityWeaponProvocation,
                        weaponRange: ability.weaponRange,
                        weaponArea: ability.weaponArea,
                    }
                    : {
                        id: ability.id,
                        name: ability.name,
                        description: ability.description,
                        action: ability.action,
                        type: ability.type,
                        kind: ability.kind,
                        weaponCount: ability.weaponCount,
                        weaponId: ability.weaponId,
                        weaponDamageDiceType: ability.weaponDamageDiceType,
                        weaponDamageDiceCount: ability.weaponDamageDiceCount,
                        weaponAttributeBonus: ability.weaponAttributeBonus,
                        weaponAttackAttribute: ability.weaponAttackAttribute,
                        weaponAttackBonusNumber: ability.weaponAttackBonusNumber,
                        weaponAttackDefense: ability.weaponAttackDefense,
                        weaponDamageType: ability.weaponDamageType,
                        weaponRecurringDamageCount: ability.weaponRecurringDamageCount,
                        weaponRecurringDamageType: ability.weaponRecurringDamageType,
                        weaponHit: ability.weaponHit,
                        weaponMiss: ability.weaponMiss,
                        weaponProvocation: ability.weaponProvocation,
                        weaponRange: ability.weaponRange,
                        weaponArea: ability.weaponArea,
                    }),
                feats: form.feats.map((feat) => ({
                    ...feat,
                    name: feat.name.trim(),
                    description: feat.description.trim(),
                })).filter(hasFeatContent),
                items: form.items,
                defenses: normalizeDefenses({
                    kp: computedState.defenseValues.kp,
                    fortitude: computedState.defenseValues.fortitude,
                    reflex: computedState.defenseValues.reflex,
                    will: computedState.defenseValues.will,
                }, zeroDefenses),
                bonuses: {
                    ...form.bonuses,
                    ...bonuses,
                },
            });
            const savedHistoryEntries = await saveCharacterHistory(characterId, historyEntries.map((entry) => ({
                ...entry,
                title: entry.title.trim(),
                content: entry.content.trim(),
            })));
            setInitialForm(form);
            setHistoryEntries(savedHistoryEntries);
            setInitialHistoryEntries(savedHistoryEntries);
            setSaving(false);
        }
        catch (nextError) {
            setError(getErrorMessage(t, nextError));
            setSaving(false);
        }
    };

    return handleSubmit;
};
