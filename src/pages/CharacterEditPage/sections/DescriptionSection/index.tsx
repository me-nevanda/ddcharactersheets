import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import styles from '../../style.module.scss'
import { useDescriptionSection } from './descriptionSectionHooks'

export const DescriptionSection = () => {
  const { t, form, handleDescriptionChange, handleShortDescriptionChange } = useDescriptionSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.description')}</h2>
      </div>

      <div className={styles.descriptionFields}>
        <div className={styles.descriptionField}>
          <div className={styles.divider} data-label={t('pages.characterEdit.fields.shortDescription')} />
          <SimpleWysiwygEditor ariaLabel={t('pages.characterEdit.fields.shortDescription')} minHeightClassName={styles.characterDescriptionTextarea} name="shortDescription" pasteAsPlainText placeholder={t('pages.characterEdit.placeholders.shortDescription')} toolbar={false} value={form.shortDescription} onChange={handleShortDescriptionChange} />
        </div>

        <div className={styles.descriptionField}>
          <div className={styles.divider} data-label={t('pages.characterEdit.fields.longDescription')} />
          <SimpleWysiwygEditor ariaLabel={t('pages.characterEdit.fields.longDescription')} minHeightClassName={styles.characterDescriptionTextarea} name="description" pasteAsPlainText placeholder={t('pages.characterEdit.placeholders.longDescription')} toolbar={false} value={form.description} onChange={handleDescriptionChange} />
        </div>
      </div>
    </section>
  )
}
