import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import type { AttributesSectionProps } from '../../types'
import { attributeDefinitions } from '@dictionaries/characterEditDefinitions'

export function AttributesSection({ attributeRows, onChange }: AttributesSectionProps) {
  const { t } = useI18n()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.attributes')}</h2>
      </div>

      <div className={styles.numericGrid}>
        {attributeDefinitions.map((definition, index) => {
          const row = attributeRows[index]

          return (
            <div className={styles.field} key={definition.key}>
              <label className={styles.label} htmlFor={definition.key}>
                {t(definition.translationKey)}
              </label>
              <div className={styles.valueRow}>
                <input
                  className={styles.input}
                  id={definition.key}
                  name={definition.key}
                  type="number"
                  min={0}
                  max={40}
                  inputMode="numeric"
                  value={row.value}
                  onChange={onChange}
                />
                <span className={styles.modifierBadge}>{row.modifierLabel}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
