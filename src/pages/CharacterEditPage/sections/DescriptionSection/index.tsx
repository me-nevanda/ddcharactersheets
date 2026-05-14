import styles from '../../style.module.scss'
import { useDescriptionSection } from './descriptionSectionHooks'

export const DescriptionSection = () => {
  const { t, form, handleGeneralChange } = useDescriptionSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.description')}</h2>
      </div>

      <label className={styles.descriptionField} htmlFor="description">
        <textarea
          className={`${styles.input} ${styles.characterDescriptionTextarea}`}
          id="description"
          name="description"
          value={form.description}
          aria-label={t('pages.characterEdit.fields.description')}
          placeholder={t('pages.characterEdit.placeholders.description')}
          onChange={handleGeneralChange}
        />
      </label>
    </section>
  )
}
