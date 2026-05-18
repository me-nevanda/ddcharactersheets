import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import styles from '../../style.module.scss'
import { useDescriptionSection } from './descriptionSectionHooks'

export const DescriptionSection = () => {
  const { t, form, handleDescriptionChange } = useDescriptionSection()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.description')}</h2>
      </div>

      <div className={styles.descriptionField}>
        <SimpleWysiwygEditor ariaLabel={t('pages.characterEdit.fields.description')} minHeightClassName={styles.characterDescriptionTextarea} name="description" placeholder={t('pages.characterEdit.placeholders.description')} toolbar={false} value={form.description} onChange={handleDescriptionChange} />
      </div>
    </section>
  )
}
