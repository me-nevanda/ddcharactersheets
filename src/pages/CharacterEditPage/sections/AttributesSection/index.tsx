import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import type { AttributesSectionProps } from '../../types'
import { attributeDefinitions } from '@dictionaries/characterEditDefinitions'

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

export function AttributesSection({ attributeRows, attributesPlus, onChange }: AttributesSectionProps) {
  const { t } = useI18n()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.attributes')}</h2>
      </div>

      <div className={styles.attributeGrid}>
        {attributeDefinitions.map((definition, index) => {
          const row = attributeRows[index]
          return (
            <div className={styles.attributeCard} key={definition.key}>
              <label className={styles.attributeField} htmlFor={definition.key}>
                <input
                  className={`${styles.input} ${styles.attributeInput}`}
                  id={definition.key}
                  name={definition.key}
                  type="number"
                  min={0}
                  max={40}
                  inputMode="numeric"
                  value={row.value}
                  onChange={onChange}
                />
                <span className={styles.attributePlus}>{formatSignedValue(attributesPlus[definition.key])}</span>
                <span className={styles.attributeLabel}>{t(definition.translationKey)}</span>
              </label>
              <span className={styles.modifierBadge}>{row.modifierLabel}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
