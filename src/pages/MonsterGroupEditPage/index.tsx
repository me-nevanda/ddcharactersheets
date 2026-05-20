import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useMonsterGroupEditPage } from './monsterGroupEditPageHooks'
import type { AssignedMonsterGroupMonsterViewModel, MonsterGroupMonsterOptionViewModel } from './types'
import styles from './style.module.scss'

const MonsterRow = ({
  action,
  monster,
  showDescription = false,
}: {
  action: ReactNode
  monster: AssignedMonsterGroupMonsterViewModel | MonsterGroupMonsterOptionViewModel
  showDescription?: boolean
}) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.monsterPickerName,
    monster.isElite ? styles.monsterNameElite : '',
    monster.isMinion ? styles.monsterNameMinion : '',
    monster.isNormal ? styles.monsterNameNormal : '',
    monster.isSolo ? styles.monsterNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={styles.monsterPickerItem}>
      <img className={styles.monsterPickerImage} src={monster.imageSrc} alt="" aria-hidden="true" />
      <div className={styles.monsterPickerSummary}>
        <h3 className={nameClassName}>
          {monster.isElite ? <AppIcon className={styles.eliteIcon} name="crown" /> : null}
          {monster.isMinion ? <AppIcon className={styles.minionIcon} name="minion" /> : null}
          {monster.isNormal ? <AppIcon className={styles.normalIcon} name="minion" /> : null}
          {monster.isSolo ? <AppIcon className={styles.soloIcon} name="crown" /> : null}
          <span>{monster.label}</span>
        </h3>
        <p className={styles.monsterPickerMeta}>
          {monster.roleLabel}
          <span aria-hidden="true"> | </span>
          {t('pages.monsterEdit.fields.level')} {monster.level}
          <span aria-hidden="true"> | </span>
          {monster.typeLabel}
        </p>
        {showDescription && monster.descriptionPreview ? <p className={styles.monsterPickerDescription}>{monster.descriptionPreview}</p> : null}
      </div>
      {action}
    </article>
  )
}

export const MonsterGroupEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const { assignedMonsters, assignedMonsterSearch, error, groupName, handleChangeAssignedMonsterSearch, handleChangeGroupName, handleChangeMonsterSearch, handleSubmit, hasChanges, loading, monsterOptions, monsterSearch, saving } = useMonsterGroupEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }

    handleTabChange('monsters')
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('monsters')
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
              <p className={styles.eyebrow}>{t('pages.monsterGroupEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="monster-group-name">
                <span className={styles.srOnly}>{t('pages.monsterGroupEdit.fields.name')}</span>
                <input className={styles.titleInput} id="monster-group-name" value={groupName} placeholder={t('pages.monsterGroupEdit.placeholders.name')} autoComplete="off" onChange={(event) => handleChangeGroupName(event.target.value)} />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to="/" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="monster-group-edit-form" type="submit" disabled={saving || !hasChanges || !groupName.trim()}>
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
          <p className={styles.loadingText}>{t('pages.monsterGroupEdit.loading')}</p>
        ) : (
          <form id="monster-group-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <div className={styles.groupEditorGrid}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.monsterGroupEdit.sections.availableMonsters')}</h2>
                  <input className={styles.headerSearchInput} id="monster-group-monster-search" value={monsterSearch} placeholder={t('pages.monsterGroupEdit.addMonsterDialog.searchPlaceholder')} aria-label={t('pages.monsterGroupEdit.addMonsterDialog.searchLabel')} onChange={(event) => handleChangeMonsterSearch(event.target.value)} />
                </div>
                <div className={styles.monsterPickerList}>
                  {monsterOptions.length > 0 ? monsterOptions.map((monster) => (
                    <MonsterRow
                      key={monster.id}
                      monster={monster}
                      action={<button className={styles.iconButton} type="button" aria-label={t('pages.monsterGroupEdit.actions.addMonster')} title={t('pages.monsterGroupEdit.actions.addMonster')} onClick={monster.onAddClick}>
                        <AppIcon name="plus" />
                      </button>}
                    />
                  )) : <p className={styles.emptyText}>{t('pages.monsterGroupEdit.addMonsterDialog.emptyState')}</p>}
                </div>
              </section>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('pages.monsterGroupEdit.sections.monsters')}</h2>
                  <input className={styles.headerSearchInput} id="monster-group-assigned-monster-search" value={assignedMonsterSearch} placeholder={t('pages.monsterGroupEdit.addMonsterDialog.searchPlaceholder')} aria-label={t('pages.monsterGroupEdit.addMonsterDialog.searchLabel')} onChange={(event) => handleChangeAssignedMonsterSearch(event.target.value)} />
                </div>
                {assignedMonsters.length > 0 ? (
                  <div className={styles.monsterPickerList}>
                    {assignedMonsters.map((monster) => (
                      <MonsterRow
                        key={monster.fileName}
                        monster={monster}
                        showDescription
                        action={<button className={`${styles.iconButton} ${styles.dangerButton}`} type="button" aria-label={t('pages.monsterGroupEdit.actions.removeMonster')} title={t('pages.monsterGroupEdit.actions.removeMonster')} onClick={monster.onRemoveClick}>
                          <AppIcon name="trash" />
                        </button>}
                      />
                    ))}
                  </div>
                ) : <p className={styles.emptyText}>{t('pages.monsterGroupEdit.emptyState')}</p>}
              </section>
            </div>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
