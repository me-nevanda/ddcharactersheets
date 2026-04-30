import styles from '../../style.module.scss'
import { useAttributesSection } from './attributesSectionHooks'

export const AttributesSection = () => {
  const { t, attributeCards, handleAttributeChange } = useAttributesSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.attributes')}</h2>
      </div>

      <div className={styles.attributeGrid}>
        {attributeCards.map((attributeCard) => (
          <div className={styles.attributeCard} key={attributeCard.inputId}>
            <label className={styles.attributeField} htmlFor={attributeCard.inputId}>
              <input
                className={`${styles.input} ${styles.attributeInput}`}
                id={attributeCard.inputId}
                name={attributeCard.inputId}
                type="number"
                min={0}
                max={40}
                inputMode="numeric"
                value={attributeCard.value}
                onChange={handleAttributeChange}
              />
              <span
                className={styles.attributePlus}
                title={attributeCard.bonusTooltip}
                aria-label={attributeCard.bonusTooltip}
              >
                {attributeCard.bonusLabel}
              </span>
              <span className={styles.attributeLabel}>{attributeCard.label}</span>
            </label>
            <span className={styles.modifierBadge}>{attributeCard.modifierLabel}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
