import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import { useI18n } from '@i18n/index'
import { usePlaceEditPage } from './placeEditPageHooks'
import styles from './style.module.scss'

export const PlaceEditPage = () => {
  const { t } = useI18n()
  const { error, form, handleAddPlaceItem, handleBackToListClick, handleCancelRemovePlaceItem, handleConfirmRemovePlaceItem, handleDescriptionChange, handleNameChange, handlePlaceItemDescriptionChange, handlePlaceItemNameChange, handleRequestRemovePlaceItem, handleSubmit, hasChanges, loading, placeItemToRemove, saving } = usePlaceEditPage()

  const placeItemRemoveName = placeItemToRemove ? (placeItemToRemove.name.trim() || t('pages.placeEdit.places.unnamedItem')) : ''

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIconFrame}>
              <AppIcon className={styles.headerIcon} name="place" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.placeEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="place-name">
                <span className={styles.srOnly}>{t('pages.placeEdit.fields.name')}</span>
                <input className={styles.titleInput} id="place-name" name="name" type="text" value={form.name} onChange={handleNameChange} placeholder={t('pages.placeEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={`${styles.floatingBackAction} ${styles.ghostButton}`} type="button" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </button>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="place-edit-form" type="submit" disabled={saving || !hasChanges}>
                <span className={styles.buttonContent}>
                  <AppIcon name="save" />
                  <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('pages.placeEdit.loading')}</p>
        ) : (
          <form id="place-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.placeEdit.fields.description')}</h2>
              </div>
              <div className={styles.descriptionField}>
                <SimpleWysiwygEditor ariaLabel={t('pages.placeEdit.fields.description')} minHeightClassName={styles.descriptionEditor} name="description" onChange={handleDescriptionChange} placeholder={t('pages.placeEdit.placeholders.description')} toolbar={false} value={form.description} />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.placeEdit.places.title')}</h2>
              </div>

              {form.places.length === 0 ? (
                <p className={styles.loadingText}>{t('pages.placeEdit.places.emptyState')}</p>
              ) : (
                <div className={styles.placeItemsList}>
                  {form.places.map((placeItem) => (
                    <article key={placeItem.id} className={styles.placeItemCard}>
                      <div className={styles.placeItemHeader}>
                        <input className={styles.placeItemTitleInput} value={placeItem.name} placeholder={t('pages.placeEdit.places.namePlaceholder')} onChange={(event) => handlePlaceItemNameChange(placeItem.id, event.target.value)} aria-label={t('pages.placeEdit.places.nameLabel')} />
                        <button className={styles.placeItemRemoveButton} type="button" aria-label={t('pages.placeEdit.places.removeButton')} title={t('pages.placeEdit.places.removeButton')} onClick={() => handleRequestRemovePlaceItem(placeItem.id)}>
                          <AppIcon name="delete" />
                        </button>
                      </div>
                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.placeEdit.places.descriptionLabel')} minHeightClassName={styles.placeItemDescriptionEditor} name={`place-item-description-${placeItem.id}`} onChange={(value) => handlePlaceItemDescriptionChange(placeItem.id, value)} placeholder={t('pages.placeEdit.places.descriptionPlaceholder')} toolbar={false} value={placeItem.description} />
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className={styles.sectionFooter}>
                <button className={styles.addPlaceItemButton} type="button" onClick={handleAddPlaceItem}>
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.placeEdit.places.addButton')}</span>
                  </span>
                </button>
              </div>
            </section>
          </form>
        )}
      </section>

      <DeleteCharacterDialog bodyKey="pages.placeEdit.places.removeDialog.body" titleKey="pages.placeEdit.places.removeDialog.title" characterName={placeItemRemoveName} deleting={false} open={Boolean(placeItemToRemove)} onCancel={handleCancelRemovePlaceItem} onConfirm={handleConfirmRemovePlaceItem} />
    </main>
  )
}
