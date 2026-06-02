import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useEditReturnNavigation } from '@pages/useEditReturnNavigation'
import { useCharacterGroupEditPage } from './characterGroupEditPageHooks'
import type { AssignedCharacterGroupCharacterViewModel, CharacterGroupCharacterOptionViewModel } from './types'
import styles from './style.module.scss'

const CharacterRow = ({
  action,
  character,
  showDescription = false,
}: {
  action: ReactNode
  character: AssignedCharacterGroupCharacterViewModel | CharacterGroupCharacterOptionViewModel
  showDescription?: boolean
}) => {
  const { t } = useI18n()

  return (
    <article className={styles.characterPickerItem} role="link" tabIndex={0} onClick={character.onOpen} onKeyDown={character.onKeyDown}>
      <div className={`${styles.characterPortraitStack} ${character.imageSrc ? styles.characterPortraitStackCustomImage : styles.characterPortraitStackDefaultImage}`}>
        {character.imageSrc ? (
          <img className={styles.characterCustomPortrait} src={character.imageSrc} alt="" aria-hidden="true" onError={character.onImageError} />
        ) : (
          <>
            <img className={styles.characterPortrait} src={character.portraitSrc} alt="" aria-hidden="true" onError={character.onImageError} />
            <img className={styles.characterClass} src={character.classSrc} alt="" aria-hidden="true" onError={character.onImageError} />
          </>
        )}
      </div>
      <div className={styles.characterPickerSummary}>
        <h3 className={styles.characterPickerName}>{character.label}</h3>
        <p className={styles.characterPickerMeta}>
          {character.raceLabel}
          <span aria-hidden="true"> | </span>
          {character.classLabel}
          <span aria-hidden="true"> | </span>
          {t('pages.characterEdit.fields.level')} {character.level}
        </p>
        {showDescription && character.descriptionPreview ? <p className={styles.characterPickerDescription}>{character.descriptionPreview}</p> : null}
      </div>
      {action}
    </article>
  )
}

export const CharacterGroupEditPage = () => {
  const { t } = useI18n()
  const { applyReturnTabs, navigateBack, returnTo } = useEditReturnNavigation({
    characterListTab: 'groups',
    mainTab: 'heroes',
    returnTo: '/',
  })
  const { assignedCharacters, assignedCharacterSearch, characterOptions, characterSearch, error, groupName, handleChangeAssignedCharacterSearch, handleChangeCharacterSearch, handleChangeGroupName, handleSubmit, hasChanges, loading, saving } = useCharacterGroupEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }

    applyReturnTabs()
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    navigateBack()
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIcon} aria-hidden="true">
              <AppIcon name="context" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.characterGroupEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="character-group-name">
                <span className={styles.srOnly}>{t('pages.characterGroupEdit.fields.name')}</span>
                <input className={styles.titleInput} id="character-group-name" value={groupName} placeholder={t('pages.characterGroupEdit.placeholders.name')} autoComplete="off" onChange={(event) => handleChangeGroupName(event.target.value)} />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to={returnTo} onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="character-group-edit-form" type="submit" disabled={saving || !hasChanges || !groupName.trim()}>
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
          <p className={styles.loadingText}>{t('pages.characterGroupEdit.loading')}</p>
        ) : (
          <form id="character-group-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <div className={styles.groupEditorGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterGroupEdit.sections.availableCharacters')}</h2>
                  <input className={styles.headerSearchInput} id="character-group-character-search" value={characterSearch} placeholder={t('pages.characterGroupEdit.addCharacterDialog.searchPlaceholder')} aria-label={t('pages.characterGroupEdit.addCharacterDialog.searchLabel')} onChange={(event) => handleChangeCharacterSearch(event.target.value)} />
                </div>
                <div className={styles.characterPickerList}>
                  {characterOptions.length > 0 ? characterOptions.map((character) => (
                    <CharacterRow
                      key={character.id}
                      character={character}
                      action={<button className={styles.iconButton} type="button" aria-label={t('pages.characterGroupEdit.actions.addCharacter')} title={t('pages.characterGroupEdit.actions.addCharacter')} onClick={character.onAddClick}>
                        <AppIcon name="plus" />
                      </button>}
                    />
                  )) : <p className={styles.emptyText}>{t('pages.characterGroupEdit.addCharacterDialog.emptyState')}</p>}
                </div>
              </section>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterGroupEdit.sections.characters')}</h2>
                  <input className={styles.headerSearchInput} id="character-group-assigned-character-search" value={assignedCharacterSearch} placeholder={t('pages.characterGroupEdit.addCharacterDialog.searchPlaceholder')} aria-label={t('pages.characterGroupEdit.addCharacterDialog.searchLabel')} onChange={(event) => handleChangeAssignedCharacterSearch(event.target.value)} />
                </div>
                {assignedCharacters.length > 0 ? (
                  <div className={styles.characterPickerList}>
                    {assignedCharacters.map((character) => (
                      <CharacterRow
                        key={character.fileName}
                        character={character}
                        showDescription
                        action={<button className={`${styles.iconButton} ${styles.dangerButton}`} type="button" aria-label={t('pages.characterGroupEdit.actions.removeCharacter')} title={t('pages.characterGroupEdit.actions.removeCharacter')} onClick={character.onRemoveClick}>
                          <AppIcon name="trash" />
                        </button>}
                      />
                    ))}
                  </div>
                ) : <p className={styles.emptyText}>{t('pages.characterGroupEdit.emptyState')}</p>}
              </section>
            </div>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
