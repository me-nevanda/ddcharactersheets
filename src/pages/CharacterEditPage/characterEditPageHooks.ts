import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getCharacter, saveCharacter } from '@lib/api';
import { useI18n } from '@i18n/index';
import { getErrorMessage } from '@lib/errors';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import { emptyAbilities, emptyArmor, emptyFeat, emptyFeats, emptyOtherItem, emptyItems, emptyWeapon, emptyForm, emptyTraining, defaultAbilityAction, defaultAbilityKind, defaultAbilityType, defaultAbilityWeaponArea, defaultAbilityWeaponDamageDiceCount, defaultAbilityWeaponDamageDiceType, defaultAbilityWeaponDamageType, defaultAbilityWeaponRecurringDamageCount, defaultAbilityWeaponRecurringDamageType, defaultAbilityWeaponAttackAttribute, defaultAbilityWeaponAttackBonusNumber, defaultAbilityWeaponAttackDefense, defaultAbilityWeaponHit, defaultAbilityWeaponMiss, defaultAbilityWeaponProvocation, defaultAbilityWeaponRange, zeroAttributeBonuses, zeroDefenses, zeroDefenseBonuses, } from '@pages/CharacterEditPage/characterEditPageUtils';
import { buildAttributeTooltip, buildDefenseTooltip, buildEquippedItemBonusSources, buildHpTooltip, buildItemAttributeBonuses, buildItemDefenseBonuses, buildItemSpeedBonus, buildSpeedTooltip, clampDefenseValue, hasFeatContent, normalizeAbilityType, normalizeAbilityWeaponArea, normalizeAbilityWeaponAttackAttribute, normalizeAbilityWeaponAttackBonusNumber, normalizeAbilityWeaponAttackDefense, normalizeAbilityWeaponDamageDiceCount, normalizeAbilityWeaponDamageDiceType, normalizeAbilityWeaponDamageType, normalizeAbilityWeaponRange, normalizeAbilityWeaponRecurringDamageCount, normalizeAlignmentValue, normalizeFeats, normalizeGenderValue, normalizeItems, normalizeWeaponBonusNumber, } from './characterEditPageLogic';
import { buildAttributeModifierMap, buildAttributeRows, buildEffectiveAttributes, buildNormalizedAttributes, clampAttributeValue, } from './sections/AttributesSection/attributesSectionLogic';
import { buildDefenseBreakdowns, buildDefenseValues, normalizeDefenses, } from './sections/DefensesSection/defensesSectionLogic';
import { buildSkillBonuses, buildSkillModifiers } from './sections/SkillSection/skillSectionLogic';
import { buildRaceAttributeBonuses, buildCharacterHp, buildCharacterSurge, buildCharacterSpeed, clampLevelValue, clampSpeedValue, formatModifier, getLevelBonus, normalizeClassValue, normalizeRaceValue, } from './sections/GeneralSection/generalSectionLogic';
import { buildFeatBonusSources, sumFeatBonus, type CharacterFeatBonusFieldName } from './featsLogic';
import { skillDefinitions } from '@dictionaries/characterEditDefinitions';
import { CharacterClass, type CharacterAbility, type CharacterAbilityType, type CharacterAttributeBonuses, type CharacterBonuses, type CharacterArmorBonusFieldName, type CharacterItemBonusFieldName, type CharacterSkillBonuses, type CharacterWeaponDamageDiceType, type CharacterWeaponFieldName, } from '../../types/character';
import type { AttributeRow, CharacterAttributeFieldName, CharacterAbilityFieldName, CharacterFeatFieldName, CharacterItemGroupKey, CharacterItemFieldName, CharacterEditFormData, CharacterEditPageState, CharacterGeneralChangeEvent, CharacterGeneralFieldName, DefenseTooltipValues, CharacterSkillFieldName, SkillModifierMap, } from './types';
export const useCharacterEditPage = (): CharacterEditPageState => {
    const { t } = useI18n();
    const { getClassLabel, getRaceLabel } = useCharacterPresentation();
    const { characterId = '' } = useParams();
    const [form, setForm] = useState<CharacterEditFormData>(emptyForm);
    const [initialForm, setInitialForm] = useState<CharacterEditFormData>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        const loadCharacter = async () => {
            try {
                const character = await getCharacter(characterId);
                if (!cancelled) {
                    const { id, updatedAt, bonuses: characterBonuses, ...characterData } = character;
                    const nextForm: CharacterEditFormData = {
                        ...characterData,
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
                            weaponName: ability.weaponName ?? '',
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
                        items: normalizeItems(character.items),
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
                    setForm(nextForm);
                    setInitialForm(nextForm);
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
    }, [characterId, t]);

    useEffect(() => {
        if (form.class !== CharacterClass.Rogue &&
            form.class !== CharacterClass.Ranger &&
            form.class !== CharacterClass.Paladin &&
            form.class !== CharacterClass.Cleric &&
            form.class !== CharacterClass.Wizard) {
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
    }, [form.class]);
    
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
            weaponName: ability.weaponName.trim(),
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
                    weaponName: '',
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
                            weaponName: '',
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
                        : fieldName === 'weaponName' && value === ''
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
        setForm((currentForm) => ({
            ...currentForm,
            items: {
                ...currentForm.items,
                [group]: group === 'weapons'
                    ? [...currentForm.items[group], { ...emptyWeapon }]
                    : group === 'armors'
                        ? [...currentForm.items[group], { ...emptyArmor }]
                        : [...currentForm.items[group], { ...emptyOtherItem }],
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
    const normalizedAttributes = buildNormalizedAttributes(form.attributes);
    const equippedItemAttributeBonuses = buildItemAttributeBonuses(form.items);
    const equippedItemDefenseBonuses = buildItemDefenseBonuses(form.items);
    const equippedItemSpeedBonus = buildItemSpeedBonus(form.items);
    const attributeBonuses = {
        strength: form.attributesPlus.strength + equippedItemAttributeBonuses.strength,
        condition: form.attributesPlus.condition + equippedItemAttributeBonuses.condition,
        dexterity: form.attributesPlus.dexterity + equippedItemAttributeBonuses.dexterity,
        intelligence: form.attributesPlus.intelligence + equippedItemAttributeBonuses.intelligence,
        wisdom: form.attributesPlus.wisdom + equippedItemAttributeBonuses.wisdom,
        charisma: form.attributesPlus.charisma + equippedItemAttributeBonuses.charisma,
    };
    const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, attributeBonuses);
    const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes);
    const levelBonusValue = getLevelBonus(form.level);
    const levelBonusLabel = formatModifier(levelBonusValue);
    const featSpeedBonus = sumFeatBonus(form.feats, 'speedBonusNumber');
    const featHpBonus = sumFeatBonus(form.feats, 'hpBonusNumber');
    const featDefenseBonuses = {
        kp: sumFeatBonus(form.feats, 'kpBonusNumber'),
        fortitude: sumFeatBonus(form.feats, 'fortitudeBonusNumber'),
        reflex: sumFeatBonus(form.feats, 'reflexBonusNumber'),
        will: sumFeatBonus(form.feats, 'willBonusNumber'),
    };
    const featSkillBonuses = skillDefinitions.reduce<CharacterSkillBonuses>((acc, skill) => {
        acc[skill.key] = sumFeatBonus(form.feats, `${skill.key}BonusNumber` as CharacterFeatBonusFieldName);
        return acc;
    }, {
        acrobatics: 0,
        arcana: 0,
        athletics: 0,
        diplomacy: 0,
        history: 0,
        healing: 0,
        deception: 0,
        perception: 0,
        endurance: 0,
        dungeons: 0,
        nature: 0,
        religion: 0,
        insight: 0,
        stealth: 0,
        streetwise: 0,
        intimidation: 0,
        thievery: 0,
    });
    const baseHpValue = buildCharacterHp(form.class, form.level, effectiveAttributes.condition);
    const hpValue = Math.max(0, baseHpValue + featHpBonus);
    const surgeValue = buildCharacterSurge(form.class, attributeModifierMap.condition);
    const speedValue = clampSpeedValue(buildCharacterSpeed(form.race) + equippedItemSpeedBonus + featSpeedBonus);
    const baseDefenseValues = buildDefenseValues(attributeModifierMap, levelBonusValue, form.race, form.class, equippedItemDefenseBonuses);
    const defenseValues = {
        kp: clampDefenseValue(baseDefenseValues.kp + featDefenseBonuses.kp),
        fortitude: clampDefenseValue(baseDefenseValues.fortitude + featDefenseBonuses.fortitude),
        reflex: clampDefenseValue(baseDefenseValues.reflex + featDefenseBonuses.reflex),
        will: clampDefenseValue(baseDefenseValues.will + featDefenseBonuses.will),
    };
    const defenseBreakdowns = buildDefenseBreakdowns(attributeModifierMap, levelBonusValue, form.race, form.class, equippedItemDefenseBonuses);
    const skillBonuses = buildSkillBonuses(form.level, attributeModifierMap, form.training, form.race, form.items);
    const skillBonusesWithFeats: CharacterSkillBonuses = {
        acrobatics: skillBonuses.acrobatics + featSkillBonuses.acrobatics,
        arcana: skillBonuses.arcana + featSkillBonuses.arcana,
        athletics: skillBonuses.athletics + featSkillBonuses.athletics,
        diplomacy: skillBonuses.diplomacy + featSkillBonuses.diplomacy,
        history: skillBonuses.history + featSkillBonuses.history,
        healing: skillBonuses.healing + featSkillBonuses.healing,
        deception: skillBonuses.deception + featSkillBonuses.deception,
        perception: skillBonuses.perception + featSkillBonuses.perception,
        endurance: skillBonuses.endurance + featSkillBonuses.endurance,
        dungeons: skillBonuses.dungeons + featSkillBonuses.dungeons,
        nature: skillBonuses.nature + featSkillBonuses.nature,
        religion: skillBonuses.religion + featSkillBonuses.religion,
        insight: skillBonuses.insight + featSkillBonuses.insight,
        stealth: skillBonuses.stealth + featSkillBonuses.stealth,
        streetwise: skillBonuses.streetwise + featSkillBonuses.streetwise,
        intimidation: skillBonuses.intimidation + featSkillBonuses.intimidation,
        thievery: skillBonuses.thievery + featSkillBonuses.thievery,
    };
    const skillModifiers = buildSkillModifiers(skillBonusesWithFeats);
    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
    const raceLabel = getRaceLabel(form.race);
    const classLabel = getClassLabel(form.class);
    const attributeBonusTooltips = {
        strength: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.strength, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'strengthBonusNumber')),
        condition: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.condition, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'conditionBonusNumber')),
        dexterity: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.dexterity, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'dexterityBonusNumber')),
        intelligence: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.intelligence, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'intelligenceBonusNumber')),
        wisdom: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.wisdom, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'wisdomBonusNumber')),
        charisma: buildAttributeTooltip(t('pages.characterEdit.sourceTooltip.raceBonus'), raceLabel, form.attributesPlus.charisma, t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'charismaBonusNumber')),
    } satisfies Record<keyof CharacterAttributeBonuses, string>;
    const featSpeedSources = buildFeatBonusSources(form.feats, 'speedBonusNumber');
    const featHpSources = buildFeatBonusSources(form.feats, 'hpBonusNumber');
    const featDefenseSources = {
        kp: buildFeatBonusSources(form.feats, 'kpBonusNumber'),
        fortitude: buildFeatBonusSources(form.feats, 'fortitudeBonusNumber'),
        reflex: buildFeatBonusSources(form.feats, 'reflexBonusNumber'),
        will: buildFeatBonusSources(form.feats, 'willBonusNumber'),
    };
    const defenseTooltips: DefenseTooltipValues = {
        kp: buildDefenseTooltip(t('pages.characterEdit.fields.kp'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.kp.levelBonus, defenseBreakdowns.kp.raceBonus, defenseBreakdowns.kp.classBonus, defenseBreakdowns.kp.attributeBonus, buildEquippedItemBonusSources(form.items, 'kpBonusNumber'), featDefenseSources.kp, defenseBreakdowns.kp.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        fortitude: buildDefenseTooltip(t('pages.characterEdit.fields.fortitude'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.fortitude.levelBonus, defenseBreakdowns.fortitude.raceBonus, defenseBreakdowns.fortitude.classBonus, defenseBreakdowns.fortitude.attributeBonus, buildEquippedItemBonusSources(form.items, 'fortitudeBonusNumber'), featDefenseSources.fortitude, defenseBreakdowns.fortitude.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        reflex: buildDefenseTooltip(t('pages.characterEdit.fields.reflex'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.reflex.levelBonus, defenseBreakdowns.reflex.raceBonus, defenseBreakdowns.reflex.classBonus, defenseBreakdowns.reflex.attributeBonus, buildEquippedItemBonusSources(form.items, 'reflexBonusNumber'), featDefenseSources.reflex, defenseBreakdowns.reflex.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        will: buildDefenseTooltip(t('pages.characterEdit.fields.will'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.will.levelBonus, defenseBreakdowns.will.raceBonus, defenseBreakdowns.will.classBonus, defenseBreakdowns.will.attributeBonus, buildEquippedItemBonusSources(form.items, 'willBonusNumber'), featDefenseSources.will, defenseBreakdowns.will.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
    };
    const speedTooltip = buildSpeedTooltip(t('pages.characterEdit.sourceTooltip.baseSpeed'), buildCharacterSpeed(form.race), t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'speedBonusNumber'), t('pages.characterEdit.sourceTooltip.featBonuses'), featSpeedSources);
    const hpTooltip = buildHpTooltip(t('pages.characterEdit.fields.hp'), hpValue, t('pages.characterEdit.sourceTooltip.featBonuses'), featHpSources);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const bonuses: CharacterBonuses = {
                level: levelBonusValue,
                attributes: attributeModifierMap,
                skills: skillBonusesWithFeats,
                defenses: defenseValues,
            };
            await saveCharacter(characterId, {
                ...form,
                name: form.name.trim(),
                level: clampLevelValue(form.level),
                gender: normalizeGenderValue(form.gender),
                alignment: normalizeAlignmentValue(form.alignment),
                speed: buildCharacterSpeed(form.race),
                hp: hpValue,
                surge: surgeValue,
                attributes: normalizedAttributes,
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
                        weaponName: '',
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
                        weaponName: ability.weaponName,
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
                    kp: defenseValues.kp,
                    fortitude: defenseValues.fortitude,
                    reflex: defenseValues.reflex,
                    will: defenseValues.will,
                }, zeroDefenses),
                bonuses: {
                    ...form.bonuses,
                    ...bonuses,
                },
            });
            setInitialForm(form);
            setSaving(false);
        }
        catch (nextError) {
            setError(getErrorMessage(t, nextError));
            setSaving(false);
        }
    };
    const attributeRows: AttributeRow[] = buildAttributeRows(normalizedAttributes, attributeModifierMap);
    return {
        error,
        form,
        loading,
        saving,
        attributeBonuses,
        attributeBonusTooltips,
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
        handleSubmit,
        attributeRows,
        levelBonusLabel,
        speedValue,
        speedTooltip,
        hpTooltip,
        skillModifiers,
        defenseValues,
        defenseTooltips,
        hpValue,
        surgeValue,
        hasChanges,
    };
};
