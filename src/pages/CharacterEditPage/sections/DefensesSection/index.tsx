import styles from '../../style.module.scss'
import { useDefensesSection } from './defensesSectionHooks'

export const DefensesSection = () => {
  const { t, defenseCards } = useDefensesSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.defenses')}</h2>
      </div>

      <div className={styles.numericGrid}>
        {defenseCards.map((defenseCard) => (
          <div className={styles.defenseCard} key={defenseCard.key}>
            <span className={styles.attributeLabel}>{defenseCard.label}</span>
            <span className={styles.modifierBadge} title={defenseCard.tooltip} aria-label={defenseCard.tooltip}>
              {defenseCard.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
