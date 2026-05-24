import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import { useI18n } from '@i18n/index'
import { useAreaEditPage } from './areaEditPageHooks'
import styles from './style.module.scss'

export const AreaEditPage = () => {
  const { t } = useI18n()
  const { error, form, handleAddPlaceItem, handleBackToListClick, handleCancelRemovePlaceItem, handleConfirmRemovePlaceItem, handleDescriptionChange, handleImageChange, handleImageRemove, handleNameChange, handlePlaceItemDescriptionChange, handlePlaceItemNameChange, handleRequestRemovePlaceItem, handleSubmit, hasChanges, imageUrl, loading, placeItemToRemove, removingImage, saving, uploadingImage } = useAreaEditPage()

  const placeItemRemoveName = placeItemToRemove ? (placeItemToRemove.name.trim() || t('pages.areaEdit.places.unnamedItem')) : ''

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={`${styles.headerImagePicker} ${imageUrl ? styles.headerImagePickerWithImage : ''}`}>
              <input id="area-image-input" className={styles.headerImageInput} type="file" accept="image/png,image/jpeg" onChange={(event) => void handleImageChange(event)} disabled={uploadingImage || removingImage} />
              {imageUrl ? (
                <>
                  <img className={styles.headerImage} src={imageUrl} alt={t('pages.areaEdit.fields.image')} />
                  <div className={styles.headerImageActions}>
                    <label className={styles.headerImageAction} htmlFor="area-image-input" aria-disabled={uploadingImage || removingImage}>
                      <AppIcon name="edit" />
                      <span>{t('pages.areaEdit.imageActions.uploadNew')}</span>
                    </label>
                    <button className={`${styles.headerImageAction} ${styles.headerImageDangerAction}`} type="button" disabled={uploadingImage || removingImage} onClick={() => void handleImageRemove()}>
                      <AppIcon name="trash" />
                      <span>{t('pages.areaEdit.imageActions.remove')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.headerImagePlaceholder} htmlFor="area-image-input">
                  {t('pages.areaEdit.placeholders.image')}
                </label>
              )}
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.areaEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="area-name">
                <span className={styles.srOnly}>{t('pages.areaEdit.fields.name')}</span>
                <input className={styles.titleInput} id="area-name" name="name" type="text" value={form.name} onChange={handleNameChange} placeholder={t('pages.areaEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={`${styles.floatingBackAction} ${styles.ghostButton}`} type="button" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </button>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="area-edit-form" type="submit" disabled={saving || !hasChanges}>
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
          <p className={styles.loadingText}>{t('pages.areaEdit.loading')}</p>
        ) : (
          <form id="area-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.areaEdit.fields.description')}</h2>
              </div>
              <div className={styles.descriptionField}>
                <SimpleWysiwygEditor ariaLabel={t('pages.areaEdit.fields.description')} minHeightClassName={styles.descriptionEditor} name="description" onChange={handleDescriptionChange} placeholder={t('pages.areaEdit.placeholders.description')} toolbar={false} value={form.description} />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.areaEdit.places.title')}</h2>
              </div>

              {form.places.length === 0 ? (
                <p className={styles.loadingText}>{t('pages.areaEdit.places.emptyState')}</p>
              ) : (
                <div className={styles.placeItemsList}>
                  {form.places.map((placeItem) => (
                    <article key={placeItem.id} className={styles.placeItemCard}>
                      <div className={styles.placeItemHeader}>
                        <input className={styles.placeItemTitleInput} value={placeItem.name} placeholder={t('pages.areaEdit.places.namePlaceholder')} onChange={(event) => handlePlaceItemNameChange(placeItem.id, event.target.value)} aria-label={t('pages.areaEdit.places.nameLabel')} />
                        <button className={styles.placeItemRemoveButton} type="button" aria-label={t('pages.areaEdit.places.removeButton')} title={t('pages.areaEdit.places.removeButton')} onClick={() => handleRequestRemovePlaceItem(placeItem.id)}>
                          <AppIcon name="delete" />
                        </button>
                      </div>
                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.areaEdit.places.descriptionLabel')} minHeightClassName={styles.placeItemDescriptionEditor} name={`place-item-description-${placeItem.id}`} onChange={(value) => handlePlaceItemDescriptionChange(placeItem.id, value)} placeholder={t('pages.areaEdit.places.descriptionPlaceholder')} toolbar={false} value={placeItem.description} />
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className={styles.sectionFooter}>
                <button className={styles.addPlaceItemButton} type="button" onClick={handleAddPlaceItem}>
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.areaEdit.places.addButton')}</span>
                  </span>
                </button>
              </div>
            </section>
          </form>
        )}
      </section>

      <DeleteCharacterDialog bodyKey="pages.areaEdit.places.removeDialog.body" titleKey="pages.areaEdit.places.removeDialog.title" characterName={placeItemRemoveName} deleting={false} open={Boolean(placeItemToRemove)} onCancel={handleCancelRemovePlaceItem} onConfirm={handleConfirmRemovePlaceItem} />
    </main>
  )
}
