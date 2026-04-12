import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import type { SkillSectionProps } from '../../types'
import { skillDefinitions } from '@dictionaries/characterEditDefinitions'

export function SkillSection({ training, skillModifiers, onChange }: SkillSectionProps) {
  const { t } = useI18n()

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
                checked={training[skill.key]}
                onChange={onChange}
              />
              <span className={styles.checkboxLabel}>{t(skill.translationKey)}</span>
            </label>
            <span className={styles.modifierBadge}>{skillModifiers[skill.key]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
