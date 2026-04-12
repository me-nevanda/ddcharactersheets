import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import { skillDefinitions } from '@dictionaries/characterEditDefinitions'
import { CharacterClass } from '../../../../types/character'

const fighterAndBarbarianHighlightedSkillKeys = new Set([
  'athletics',
  'endurance',
  'healing',
  'intimidation',
  'insight',
])

const paladinHighlightedSkillKeys = new Set([
  'diplomacy',
  'endurance',
  'healing',
  'history',
  'insight',
  'intimidation',
  'religion',
])

const rangerHighlightedSkillKeys = new Set([
  'acrobatics',
  'athletics',
  'dungeoneering',
  'endurance',
  'healing',
  'nature',
  'perception',
  'stealth',
])

const rogueHighlightedSkillKeys = new Set([
  'acrobatics',
  'athletics',
  'deception',
  'dungeoneering',
  'insight',
  'intimidation',
  'perception',
  'stealth',
  'streetwise',
  'thievery',
])

const rogueForcedSkillKeys = new Set(['stealth', 'thievery'])
const rangerForcedSkillKeys = new Set(['nature'])
const paladinForcedSkillKeys = new Set(['religion'])
const clericHighlightedSkillKeys = new Set(['arcana', 'diplomacy', 'healing', 'history', 'insight'])
const clericForcedSkillKeys = new Set(['religion'])
const wizardHighlightedSkillKeys = new Set(['arcana', 'diplomacy', 'dungeoneering', 'history', 'insight', 'nature', 'religion'])
const wizardForcedSkillKeys = new Set(['arcana'])
const warlockHighlightedSkillKeys = new Set(['arcana', 'deception', 'history', 'insight', 'intimidation', 'religion', 'streetwise', 'thievery'])
const warlordAndBardHighlightedSkillKeys = new Set([
  'athletics',
  'diplomacy',
  'endurance',
  'healing',
  'history',
  'intimidation',
])

export function SkillSection() {
  const { t } = useI18n()
  const { form, skillModifiers, handleTrainingChange } = useCharacterEditPageContext()
  const highlightedSkillKeys =
    form.class === CharacterClass.Paladin
      ? paladinHighlightedSkillKeys
      : form.class === CharacterClass.Cleric
        ? clericHighlightedSkillKeys
      : form.class === CharacterClass.Wizard
        ? wizardHighlightedSkillKeys
        : form.class === CharacterClass.Warlock
          ? warlockHighlightedSkillKeys
      : form.class === CharacterClass.Warlord || form.class === CharacterClass.Bard
        ? warlordAndBardHighlightedSkillKeys
      : form.class === CharacterClass.Ranger
        ? rangerHighlightedSkillKeys
        : form.class === CharacterClass.Rogue
          ? rogueHighlightedSkillKeys
      : fighterAndBarbarianHighlightedSkillKeys
  const highlightTrainingLabels =
    form.class === CharacterClass.Paladin ||
    form.class === CharacterClass.Fighter ||
    form.class === CharacterClass.Barbarian ||
    form.class === CharacterClass.Ranger ||
    form.class === CharacterClass.Rogue ||
    form.class === CharacterClass.Cleric ||
    form.class === CharacterClass.Wizard
    || form.class === CharacterClass.Warlock
    || form.class === CharacterClass.Warlord
    || form.class === CharacterClass.Bard
  const isRogue = form.class === CharacterClass.Rogue
  const isRanger = form.class === CharacterClass.Ranger
  const isPaladin = form.class === CharacterClass.Paladin
  const isCleric = form.class === CharacterClass.Cleric
  const isWizard = form.class === CharacterClass.Wizard

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.training')}</h2>
      </div>

      <div className={styles.skillGrid}>
        {skillDefinitions.map((skill) => (
          <div className={styles.skillCard} key={skill.key}>
            <label className={styles.checkboxField} htmlFor={skill.key}>
              <input
                className={styles.checkboxInput}
                id={skill.key}
                name={skill.key}
                type="checkbox"
                checked={
                  (isRogue && rogueForcedSkillKeys.has(skill.key)) ||
                  (isRanger && rangerForcedSkillKeys.has(skill.key))
                    || (isPaladin && paladinForcedSkillKeys.has(skill.key))
                    || (isCleric && clericForcedSkillKeys.has(skill.key))
                    || (isWizard && wizardForcedSkillKeys.has(skill.key))
                    ? true
                    : form.training[skill.key]
                }
                disabled={
                  (isRogue && rogueForcedSkillKeys.has(skill.key)) ||
                  (isRanger && rangerForcedSkillKeys.has(skill.key))
                    || (isPaladin && paladinForcedSkillKeys.has(skill.key))
                    || (isCleric && clericForcedSkillKeys.has(skill.key))
                    || (isWizard && wizardForcedSkillKeys.has(skill.key))
                }
                onChange={handleTrainingChange}
              />
              <span
                className={`${styles.checkboxLabel} ${
                  highlightTrainingLabels && highlightedSkillKeys.has(skill.key)
                    ? styles.checkboxLabelHighlight
                    : ''
                }`}
              >
                {t(skill.translationKey)}
              </span>
            </label>
            <span className={styles.modifierBadge}>{skillModifiers[skill.key]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
