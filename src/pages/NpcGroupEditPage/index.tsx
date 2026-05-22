import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useNpcGroupEditPage } from './npcGroupEditPageHooks'
import type { AssignedNpcGroupNpcViewModel, NpcGroupNpcOptionViewModel } from './types'
import styles from './style.module.scss'

const NpcRow = ({
  action,
  npc,
  showDescription = false,
}: {
  action: ReactNode
  npc: AssignedNpcGroupNpcViewModel | NpcGroupNpcOptionViewModel
  showDescription?: boolean
}) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.npcPickerName,
    npc.isElite ? styles.npcNameElite : '',
    npc.isMinion ? styles.npcNameMinion : '',
    npc.isNormal ? styles.npcNameNormal : '',
    npc.isSolo ? styles.npcNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={`${styles.npcPickerItem} ${npc.isDead ? styles.npcPickerItemDead : ''}`} role="link" tabIndex={0} onClick={npc.onOpen} onKeyDown={npc.onKeyDown}>
      <img className={styles.npcPickerImage} src={npc.imageSrc} alt="" aria-hidden="true" />
      <div className={styles.npcPickerSummary}>
        <h3 className={nameClassName}>
          {npc.isElite ? <AppIcon className={styles.eliteIcon} name="crown" /> : null}
          {npc.isMinion ? <AppIcon className={styles.minionIcon} name="minion" /> : null}
          {npc.isNormal ? <AppIcon className={styles.normalIcon} name="minion" /> : null}
          {npc.isSolo ? <AppIcon className={styles.soloIcon} name="crown" /> : null}
          <span>{npc.label}</span>
        </h3>
        {npc.isStory ? (
          <p className={styles.npcPickerMeta}>{npc.storyLabel}</p>
        ) : (
          <p className={styles.npcPickerMeta}>
            {npc.roleLabel}
            <span aria-hidden="true"> | </span>
            {t('pages.npcEdit.fields.level')} {npc.level}
            <span aria-hidden="true"> | </span>
            {npc.typeLabel}
          </p>
        )}
        {showDescription && npc.descriptionPreview ? <p className={styles.npcPickerDescription}>{npc.descriptionPreview}</p> : null}
      </div>
      {action}
    </article>
  )
}

export const NpcGroupEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const { assignedNpcs, assignedNpcSearch, error, groupName, handleChangeAssignedNpcSearch, handleChangeGroupName, handleChangeNpcSearch, handleSubmit, hasChanges, loading, npcOptions, npcSearch, saving } = useNpcGroupEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }

    handleTabChange('npcs')
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('npcs')
    navigate('/')
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIcon} aria-hidden="true">
              <AppIcon name="monster" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.npcGroupEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="npc-group-name">
                <span className={styles.srOnly}>{t('pages.npcGroupEdit.fields.name')}</span>
                <input className={styles.titleInput} id="npc-group-name" value={groupName} placeholder={t('pages.npcGroupEdit.placeholders.name')} autoComplete="off" onChange={(event) => handleChangeGroupName(event.target.value)} />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to="/" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="npc-group-edit-form" type="submit" disabled={saving || !hasChanges || !groupName.trim()}>
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
          <p className={styles.loadingText}>{t('pages.npcGroupEdit.loading')}</p>
        ) : (
          <form id="npc-group-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <div className={styles.groupEditorGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.npcGroupEdit.sections.availableNpcs')}</h2>
                  <input className={styles.headerSearchInput} id="npc-group-npc-search" value={npcSearch} placeholder={t('pages.npcGroupEdit.addNpcDialog.searchPlaceholder')} aria-label={t('pages.npcGroupEdit.addNpcDialog.searchLabel')} onChange={(event) => handleChangeNpcSearch(event.target.value)} />
                </div>
                <div className={styles.npcPickerList}>
                  {npcOptions.length > 0 ? npcOptions.map((npc) => (
                    <NpcRow
                      key={npc.id}
                      npc={npc}
                      action={<button className={styles.iconButton} type="button" aria-label={t('pages.npcGroupEdit.actions.addNpc')} title={t('pages.npcGroupEdit.actions.addNpc')} onClick={npc.onAddClick}>
                        <AppIcon name="plus" />
                      </button>}
                    />
                  )) : <p className={styles.emptyText}>{t('pages.npcGroupEdit.addNpcDialog.emptyState')}</p>}
                </div>
              </section>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.npcGroupEdit.sections.npcs')}</h2>
                  <input className={styles.headerSearchInput} id="npc-group-assigned-npc-search" value={assignedNpcSearch} placeholder={t('pages.npcGroupEdit.addNpcDialog.searchPlaceholder')} aria-label={t('pages.npcGroupEdit.addNpcDialog.searchLabel')} onChange={(event) => handleChangeAssignedNpcSearch(event.target.value)} />
                </div>
                {assignedNpcs.length > 0 ? (
                  <div className={styles.npcPickerList}>
                    {assignedNpcs.map((npc) => (
                      <NpcRow
                        key={npc.fileName}
                        npc={npc}
                        showDescription
                        action={<button className={`${styles.iconButton} ${styles.dangerButton}`} type="button" aria-label={t('pages.npcGroupEdit.actions.removeNpc')} title={t('pages.npcGroupEdit.actions.removeNpc')} onClick={npc.onRemoveClick}>
                          <AppIcon name="trash" />
                        </button>}
                      />
                    ))}
                  </div>
                ) : <p className={styles.emptyText}>{t('pages.npcGroupEdit.emptyState')}</p>}
              </section>
            </div>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
