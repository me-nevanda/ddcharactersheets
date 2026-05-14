import { useEffect, type ChangeEvent } from 'react';
import { emptyArmor, emptyFeat, emptyOtherItem, emptyTraining, emptyWeapon, defaultAbilityAction, defaultAbilityKind, defaultAbilityType, defaultAbilityWeaponArea, defaultAbilityWeaponAttackAttribute, defaultAbilityWeaponAttackBonusNumber, defaultAbilityWeaponAttackDefense, defaultAbilityWeaponDamageDiceCount, defaultAbilityWeaponDamageDiceType, defaultAbilityWeaponDamageType, defaultAbilityWeaponHit, defaultAbilityWeaponMiss, defaultAbilityWeaponProvocation, defaultAbilityWeaponRange, defaultAbilityWeaponRecurringDamageCount, defaultAbilityWeaponRecurringDamageType, } from '@pages/CharacterEditPage/characterEditPageUtils';
import { normalizeAlignmentValue, normalizeAbilityType, normalizeAbilityWeaponAttackAttribute, normalizeAbilityWeaponAttackBonusNumber, normalizeAbilityWeaponAttackDefense, normalizeGenderValue, } from '../characterEditPageLogic';
import { clampAttributeValue } from '../sections/AttributesSection/attributesSectionHooks';
import { buildRaceAttributeBonuses, clampLevelValue, normalizeClassValue, normalizeRaceValue } from '../sections/GeneralSection/generalSectionHooks';
import { CharacterClass, type CharacterAbility, type CharacterAbilityType, type CharacterArmorBonusFieldName, type CharacterItemBonusFieldName, type CharacterWeaponDamageDiceType, type CharacterWeaponFieldName } from '../../../types/character';
import type { CharacterEditPageHandlers, CharacterEditPageSetForm, CharacterAbilityFieldName, CharacterAttributeFieldName, CharacterFeatFieldName, CharacterGeneralChangeEvent, CharacterGeneralFieldName, CharacterItemFieldName, CharacterItemGroupKey, CharacterSkillFieldName } from '../types';
import type { CharacterFeatBonusFieldName } from '../featsLogic';

export const useCharacterEditPageClassTrainingRules = (characterClass: CharacterClass, setForm: CharacterEditPageSetForm) => {
    useEffect(() => {
        if (characterClass !== CharacterClass.Rogue &&
            characterClass !== CharacterClass.Ranger &&
            characterClass !== CharacterClass.Paladin &&
            characterClass !== CharacterClass.Cleric &&
            characterClass !== CharacterClass.Wizard) {
            return;
        }
        setForm((currentForm) => {
            const shouldForceRogueSkills = currentForm.class === CharacterClass.Rogue &&
                currentForm.training.stealth &&
                currentForm.training.thievery;
            const shouldForceRangerSkill = currentForm.class === CharacterClass.Ranger && currentForm.training.nature;
            const shouldForcePaladinSkill = currentForm.class === CharacterClass.Paladin && currentForm.training.religion;
            const shouldForceClericSkill = currentForm.class === CharacterClass.Cleric && currentForm.training.religion;
            const shouldForceWizardSkill = currentForm.class === CharacterClass.Wizard && currentForm.training.arcana;
            if (shouldForceRogueSkills ||
                shouldForceRangerSkill ||
                shouldForcePaladinSkill ||
                shouldForceClericSkill ||
                shouldForceWizardSkill) {
                return currentForm;
            }
            return {
                ...currentForm,
                training: {
                    ...currentForm.training,
                    stealth: currentForm.class === CharacterClass.Rogue ? true : currentForm.training.stealth,
                    thievery: currentForm.class === CharacterClass.Rogue ? true : currentForm.training.thievery,
                    nature: currentForm.class === CharacterClass.Ranger ? true : currentForm.training.nature,
                    religion: currentForm.class === CharacterClass.Paladin || currentForm.class === CharacterClass.Cleric
                        ? true
                        : currentForm.training.religion,
                    arcana: currentForm.class === CharacterClass.Wizard ? true : currentForm.training.arcana,
                },
            };
        });
    }, [characterClass, setForm]);
};

export const useCharacterEditPageFormHandlers = (setForm: CharacterEditPageSetForm): CharacterEditPageHandlers => {
    const handleGeneralChange = (event: CharacterGeneralChangeEvent) => {
        const { name, value } = event.target;
        const fieldName = name as CharacterGeneralFieldName;
        if (fieldName === 'level') {
            setForm((currentForm) => ({
                ...currentForm,
                level: clampLevelValue(Number.parseInt(value, 10) || 1),
            }));
            return;
        }
        if (fieldName === 'race') {
            const nextRace = normalizeRaceValue(value);
            setForm((currentForm) => ({
                ...currentForm,
                race: nextRace,
                attributesPlus: buildRaceAttributeBonuses(nextRace),
            }));
            return;
        }
        if (fieldName === 'class') {
            setForm((currentForm) => ({
                ...currentForm,
                class: normalizeClassValue(value),
                training: emptyTraining,
            }));
            return;
        }
        if (fieldName === 'gender') {
            setForm((currentForm) => ({
                ...currentForm,
                gender: normalizeGenderValue(value),
            }));
            return;
        }
        if (fieldName === 'alignment') {
            setForm((currentForm) => ({
                ...currentForm,
                alignment: normalizeAlignmentValue(value),
            }));
            return;
        }
        setForm((currentForm) => ({
            ...currentForm,
            [fieldName]: value,
        }));
    };

    const handleAttributeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const fieldName = name as CharacterAttributeFieldName;
        const nextValue = clampAttributeValue(Number.parseInt(value, 10) || 0);
        setForm((currentForm) => ({
            ...currentForm,
            attributes: {
                ...currentForm.attributes,
                [fieldName]: nextValue,
            },
        }));
    };

    const handleTrainingChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, name } = event.target;
        const fieldName = name as CharacterSkillFieldName;
        setForm((currentForm) => ({
            ...currentForm,
            training: {
                ...currentForm.training,
                [fieldName]: checked,
            },
        }));
    };

    const handleAbilityAdd = (ability: CharacterAbility) => {
        const nextAbility: CharacterAbility = {
            id: globalThis.crypto.randomUUID(),
            name: ability.name.trim(),
            description: ability.description.trim(),
            action: ability.action,
            type: normalizeAbilityType(ability.type),
            kind: ability.kind,
            weaponCount: ability.weaponCount,
            weaponId: ability.weaponId.trim(),
            weaponDamageDiceType: ability.weaponDamageDiceType,
            weaponDamageDiceCount: ability.weaponDamageDiceCount,
            weaponAttributeBonus: ability.weaponAttributeBonus,
            weaponAttackAttribute: normalizeAbilityWeaponAttackAttribute(ability.weaponAttackAttribute),
            weaponAttackDefense: normalizeAbilityWeaponAttackDefense(ability.weaponAttackDefense),
            weaponDamageType: ability.weaponDamageType,
            weaponAttackBonusNumber: normalizeAbilityWeaponAttackBonusNumber(ability.weaponAttackBonusNumber),
            weaponRecurringDamageCount: ability.weaponRecurringDamageCount,
            weaponRecurringDamageType: ability.weaponRecurringDamageType,
            weaponHit: ability.weaponHit,
            weaponMiss: ability.weaponMiss,
            weaponProvocation: ability.weaponProvocation,
            weaponRange: ability.weaponRange,
            weaponArea: ability.weaponArea,
        };
        if (!nextAbility.name && !nextAbility.description) {
            return;
        }
        setForm((currentForm) => ({
            ...currentForm,
            abilities: [...currentForm.abilities, nextAbility],
        }));
    };

    const handleAbilityCreateEmpty = (type: CharacterAbilityType = defaultAbilityType) => {
        setForm((currentForm) => ({
            ...currentForm,
            abilities: [
                ...currentForm.abilities,
                {
                    id: globalThis.crypto.randomUUID(),
                    name: '',
                    description: '',
                    action: defaultAbilityAction,
                    type,
                    kind: defaultAbilityKind,
                    weaponCount: 1,
                    weaponId: '',
                    weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                    weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                    weaponAttributeBonus: '',
                    weaponAttackAttribute: 'strength',
                    weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                    weaponAttackDefense: 'kp',
                    weaponDamageType: defaultAbilityWeaponDamageType,
                    weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                    weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                    weaponHit: defaultAbilityWeaponHit,
                    weaponMiss: defaultAbilityWeaponMiss,
                    weaponProvocation: defaultAbilityWeaponProvocation,
                    weaponRange: defaultAbilityWeaponRange,
                    weaponArea: defaultAbilityWeaponArea,
                },
            ],
        }));
    };

    const handleAbilityChange = (index: number, fieldName: CharacterAbilityFieldName, value: string | number) => {
        setForm((currentForm) => ({
            ...currentForm,
            abilities: currentForm.abilities.map((ability, abilityIndex) => abilityIndex === index
                ? {
                    ...ability,
                    [fieldName]: value,
                    ...(fieldName === 'kind' && value === 'utility'
                        ? {
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
                        }
                        : fieldName === 'weaponId' && value === ''
                            ? {
                                weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                                weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                                weaponDamageType: defaultAbilityWeaponDamageType,
                                weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                                weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                                weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                                weaponHit: defaultAbilityWeaponHit,
                                weaponMiss: defaultAbilityWeaponMiss,
                                weaponProvocation: defaultAbilityWeaponProvocation,
                            }
                            : null),
                }
                : ability),
        }));
    };

    const handleAbilityRemove = (index: number) => {
        setForm((currentForm) => ({
            ...currentForm,
            abilities: currentForm.abilities.filter((_, abilityIndex) => abilityIndex !== index),
        }));
    };

    const handleFeatCreateEmpty = () => {
        setForm((currentForm) => ({
            ...currentForm,
            feats: [
                ...currentForm.feats,
                {
                    ...emptyFeat,
                    id: globalThis.crypto.randomUUID(),
                    visible: true,
                },
            ],
        }));
    };

    const handleFeatChange = (index: number, fieldName: CharacterFeatFieldName, value: string | number | boolean) => {
        setForm((currentForm) => ({
            ...currentForm,
            feats: currentForm.feats.map((feat, featIndex) => featIndex === index
                ? {
                    ...feat,
                    [fieldName]: value,
                }
                : feat),
        }));
    };

    const handleFeatBonusFieldChange = (index: number, previousFieldName: CharacterFeatBonusFieldName, nextFieldName: CharacterFeatBonusFieldName) => {
        setForm((currentForm) => ({
            ...currentForm,
            feats: currentForm.feats.map((feat, featIndex) => {
                if (featIndex !== index || previousFieldName === nextFieldName) {
                    return feat;
                }
                return {
                    ...feat,
                    [previousFieldName]: 0,
                    [nextFieldName]: feat[previousFieldName],
                };
            }),
        }));
    };

    const handleFeatRemove = (index: number) => {
        setForm((currentForm) => ({
            ...currentForm,
            feats: currentForm.feats.filter((_, featIndex) => featIndex !== index),
        }));
    };

    const handleItemCreateEmpty = (group: CharacterItemGroupKey) => {
        const nextItemId = globalThis.crypto.randomUUID();
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                [group]: group === 'weapons'
                    ? [...currentForm.items[group], { ...emptyWeapon, id: nextItemId }]
                    : group === 'armors'
                        ? [...currentForm.items[group], { ...emptyArmor, id: nextItemId }]
                        : [...currentForm.items[group], { ...emptyOtherItem, id: nextItemId }],
            },
        }));
    };

    const handleItemChange = (group: CharacterItemGroupKey, index: number, fieldName: CharacterItemFieldName | CharacterItemBonusFieldName, value: string | number | boolean) => {
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                [group]: currentForm.items[group].map((item, itemIndex) => itemIndex === index
                    ? {
                        ...item,
                        [fieldName]: value,
                    }
                    : item),
            },
        }));
    };

    const handleItemBonusFieldChange = (group: CharacterItemGroupKey, index: number, previousFieldName: CharacterArmorBonusFieldName, nextFieldName: CharacterArmorBonusFieldName) => {
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                [group]: currentForm.items[group].map((item, itemIndex) => {
                    if (itemIndex !== index || previousFieldName === nextFieldName) {
                        return item;
                    }
                    const previousValue = item[previousFieldName as keyof typeof item];
                    return {
                        ...item,
                        [previousFieldName]: 0,
                        [nextFieldName]: typeof previousValue === 'number' ? previousValue : 0,
                    };
                }),
            },
        }));
    };

    const handleArmorBonusChange = (index: number, fieldName: CharacterArmorBonusFieldName, value: number) => {
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                armors: currentForm.items.armors.map((armor, armorIndex) => armorIndex === index
                    ? {
                        ...armor,
                        [fieldName]: value,
                    }
                    : armor),
            },
        }));
    };

    const handleWeaponDamageChange = (index: number, fieldName: CharacterWeaponFieldName, value: number | CharacterWeaponDamageDiceType | boolean) => {
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                weapons: currentForm.items.weapons.map((weapon, weaponIndex) => weaponIndex === index
                    ? {
                        ...weapon,
                        [fieldName]: value,
                    }
                    : weapon),
            },
        }));
    };

    const handleItemRemove = (group: CharacterItemGroupKey, index: number) => {
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                [group]: currentForm.items[group].filter((_, itemIndex) => itemIndex !== index),
            },
        }));
    };

    return {
        handleGeneralChange,
        handleAttributeChange,
        handleTrainingChange,
        handleAbilityCreateEmpty,
        handleAbilityAdd,
        handleAbilityChange,
        handleAbilityRemove,
        handleFeatCreateEmpty,
        handleFeatChange,
        handleFeatBonusFieldChange,
        handleFeatRemove,
        handleItemCreateEmpty,
        handleItemChange,
        handleItemBonusFieldChange,
        handleArmorBonusChange,
        handleWeaponDamageChange,
        handleItemRemove,
    };
};
