import { buildAttributeTooltip, buildDefenseTooltip, buildEquippedItemBonusSources, buildHpTooltip, buildItemAttributeBonuses, buildItemDefenseBonuses, buildItemSpeedBonus, buildSpeedTooltip, clampDefenseValue } from '../characterEditPageLogic';
import type { TranslationVariables } from '@i18n/types';
import { buildAttributeModifierMap, buildAttributeRows, buildEffectiveAttributes, buildNormalizedAttributes } from '../sections/AttributesSection/attributesSectionHooks';
import { buildDefenseBreakdowns, buildDefenseValues } from '../sections/DefensesSection/defensesSectionHooks';
import { buildSkillBonuses, buildSkillModifiers } from '../sections/SkillSection/skillSectionHooks';
import { buildCharacterHp, buildCharacterSpeed, buildCharacterSurge, clampSpeedValue, formatModifier, getLevelBonus } from '../sections/GeneralSection/generalSectionHooks';
import { buildFeatBonusSources, sumFeatBonus, type CharacterFeatBonusFieldName } from '../featsLogic';
import { skillDefinitions } from '@dictionaries/characterEditDefinitions';
import type { CharacterAttributeBonuses, CharacterHistoryEntry, CharacterSkillBonuses } from '@appTypes/character';
import type { CharacterEditFormData, CharacterEditPageComputedState } from '../types';

export const useCharacterEditPageDerivedState = (
    form: CharacterEditFormData,
    initialForm: CharacterEditFormData,
    historyEntries: CharacterHistoryEntry[],
    initialHistoryEntries: CharacterHistoryEntry[],
    t: (key: string, variables?: TranslationVariables) => string,
    getRaceLabel: (race: CharacterEditFormData['race']) => string,
    getClassLabel: (characterClass: CharacterEditFormData['class']) => string,
): CharacterEditPageComputedState => {
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
    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm) || JSON.stringify(historyEntries) !== JSON.stringify(initialHistoryEntries);
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
    const defenseTooltips = {
        kp: buildDefenseTooltip(t('pages.characterEdit.fields.kp'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.kp.levelBonus, defenseBreakdowns.kp.raceBonus, defenseBreakdowns.kp.classBonus, defenseBreakdowns.kp.attributeBonus, buildEquippedItemBonusSources(form.items, 'kpBonusNumber'), featDefenseSources.kp, defenseBreakdowns.kp.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        fortitude: buildDefenseTooltip(t('pages.characterEdit.fields.fortitude'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.fortitude.levelBonus, defenseBreakdowns.fortitude.raceBonus, defenseBreakdowns.fortitude.classBonus, defenseBreakdowns.fortitude.attributeBonus, buildEquippedItemBonusSources(form.items, 'fortitudeBonusNumber'), featDefenseSources.fortitude, defenseBreakdowns.fortitude.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        reflex: buildDefenseTooltip(t('pages.characterEdit.fields.reflex'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.reflex.levelBonus, defenseBreakdowns.reflex.raceBonus, defenseBreakdowns.reflex.classBonus, defenseBreakdowns.reflex.attributeBonus, buildEquippedItemBonusSources(form.items, 'reflexBonusNumber'), featDefenseSources.reflex, defenseBreakdowns.reflex.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
        will: buildDefenseTooltip(t('pages.characterEdit.fields.will'), t('pages.characterEdit.defenseTooltip.levelBonus'), t('pages.characterEdit.sourceTooltip.raceBonus'), t('pages.characterEdit.defenseTooltip.classBonus'), t('pages.characterEdit.defenseTooltip.attributesBonus'), t('pages.characterEdit.defenseTooltip.itemsBonus'), t('pages.characterEdit.sourceTooltip.featBonuses'), raceLabel, classLabel, defenseBreakdowns.will.levelBonus, defenseBreakdowns.will.raceBonus, defenseBreakdowns.will.classBonus, defenseBreakdowns.will.attributeBonus, buildEquippedItemBonusSources(form.items, 'willBonusNumber'), featDefenseSources.will, defenseBreakdowns.will.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`))),
    };
    const speedTooltip = buildSpeedTooltip(t('pages.characterEdit.sourceTooltip.baseSpeed'), buildCharacterSpeed(form.race), t('pages.characterEdit.sourceTooltip.itemBonus'), buildEquippedItemBonusSources(form.items, 'speedBonusNumber'), t('pages.characterEdit.sourceTooltip.featBonuses'), featSpeedSources);
    const hpTooltip = buildHpTooltip(t('pages.characterEdit.fields.hp'), hpValue, t('pages.characterEdit.sourceTooltip.featBonuses'), featHpSources);
    return {
        attributeBonuses,
        attributeBonusTooltips,
        attributeModifierMap,
        attributeRows: buildAttributeRows(normalizedAttributes, attributeModifierMap),
        defenseTooltips,
        defenseValues,
        hasChanges,
        hpTooltip,
        hpValue,
        levelBonusLabel,
        levelBonusValue,
        normalizedAttributes,
        skillBonusesWithFeats,
        skillModifiers,
        speedTooltip,
        speedValue,
        surgeValue,
    };
};
