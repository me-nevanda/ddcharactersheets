import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import { useCharacterEditPageContext } from '../../characterEditPageContext'

export function DefensesSection() {
  const { t } = useI18n()
  const { defenseValues } = useCharacterEditPageContext()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.defenses')}</h2>
      </div>

      <div className={styles.numericGrid}>
        <div className={styles.field}>
          <div className={styles.defenseRow}>
            <span className={styles.label}>{t('pages.characterEdit.fields.kp')}</span>
            <span className={styles.modifierBadge}>{defenseValues.kp}</span>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.defenseRow}>
            <span className={styles.label}>{t('pages.characterEdit.fields.fortitude')}</span>
            <span className={styles.modifierBadge}>{defenseValues.fortitude}</span>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.defenseRow}>
            <span className={styles.label}>{t('pages.characterEdit.fields.reflex')}</span>
            <span className={styles.modifierBadge}>{defenseValues.reflex}</span>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.defenseRow}>
            <span className={styles.label}>{t('pages.characterEdit.fields.will')}</span>
            <span className={styles.modifierBadge}>{defenseValues.will}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
