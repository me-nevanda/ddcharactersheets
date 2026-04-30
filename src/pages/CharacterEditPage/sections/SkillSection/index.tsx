import styles from '../../style.module.scss'
import { useSkillSection } from './skillSectionHooks'

export const SkillSection = () => {
  const { t, skillCards, handleTrainingChange } = useSkillSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.skills')}</h2>
      </div>

      <div className={styles.skillGrid}>
        {skillCards.map((skillCard) => (
          <div className={styles.skillCard} key={skillCard.key}>
            <label className={styles.checkboxField} htmlFor={skillCard.key}>
              <input
                className={styles.checkboxInput}
                id={skillCard.key}
                name={skillCard.key}
                type="checkbox"
                checked={skillCard.checked}
                disabled={skillCard.disabled}
                onChange={handleTrainingChange}
              />
              <span className={`${styles.checkboxLabel} ${skillCard.highlighted ? styles.checkboxLabelHighlight : ''}`}>
                {skillCard.label}
              </span>
            </label>
            <span className={styles.modifierBadge} title={skillCard.tooltip} aria-label={skillCard.tooltip}>
              {skillCard.modifierLabel}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
