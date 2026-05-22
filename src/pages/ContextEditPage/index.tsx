import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useContextEditPage } from './contextEditPageHooks'
import type {
  ContextCharacterCardViewModel,
  ContextCharacterOptionViewModel,
  ContextMonsterCardViewModel,
  ContextMonsterGroupOptionViewModel,
  ContextMonsterGroupSectionViewModel,
  ContextNpcCardViewModel,
  ContextNpcGroupOptionViewModel,
  ContextNpcGroupSectionViewModel,
} from './types'
import styles from './style.module.scss'

const CharacterPortrait = ({
  hasCustomImage,
  imageSrc,
  portraitSrc,
  classSrc,
}: {
  hasCustomImage: boolean
  imageSrc: string
  portraitSrc: string
  classSrc: string
}) => {
  if (hasCustomImage && imageSrc) {
    return (
      <div className={styles.heroPortraitStack}>
        <img className={styles.heroPortraitCustom} src={imageSrc} alt="" aria-hidden="true" />
      </div>
    )
  }
  return (
    <div className={styles.heroPortraitStack}>
      <img className={styles.heroPortrait} src={portraitSrc} alt="" aria-hidden="true" />
      <img className={styles.heroPortraitClass} src={classSrc} alt="" aria-hidden="true" />
    </div>
  )
}

const HeroCard = ({ card }: { card: ContextCharacterCardViewModel }) => {
  const { t } = useI18n()
  return (
    <article className={styles.heroCard}>
      <CharacterPortrait
        hasCustomImage={card.hasCustomImage}
        imageSrc={card.imageSrc}
        portraitSrc={card.portraitSrc}
        classSrc={card.classSrc}
      />
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{card.label}</h3>
        <p className={styles.heroMeta}>
          {card.raceLabel ? <span>{card.raceLabel}</span> : null}
          {card.raceLabel && card.classLabel ? <span aria-hidden="true"> | </span> : null}
          {card.classLabel ? <span>{card.classLabel}</span> : null}
          {(card.raceLabel || card.classLabel) && card.level ? <span aria-hidden="true"> | </span> : null}
          {card.level ? <span>{t('pages.characterEdit.fields.level')} {card.level}</span> : null}
        </p>
      </div>
      <button
        type="button"
        className={styles.heroRemoveButton}
        aria-label={t('pages.contextEdit.characters.removeButton')}
        title={t('pages.contextEdit.characters.removeButton')}
        onClick={card.onRemoveClick}
      >
        <AppIcon name="trash" />
      </button>
    </article>
  )
}

const HeroOption = ({ option }: { option: ContextCharacterOptionViewModel }) => {
  const { t } = useI18n()
  return (
    <article
      className={`${styles.heroOption} ${option.selected ? styles.heroOptionSelected : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={option.selected}
      onClick={option.onToggleSelected}
      onKeyDown={option.onKeyDown}
    >
      <span className={styles.heroOptionCheckbox} aria-hidden="true">
        {option.selected ? <AppIcon name="check" /> : null}
      </span>
      <CharacterPortrait
        hasCustomImage={option.hasCustomImage}
        imageSrc={option.imageSrc}
        portraitSrc={option.portraitSrc}
        classSrc={option.classSrc}
      />
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{option.label}</h3>
        <p className={styles.heroMeta}>
          {option.raceLabel ? <span>{option.raceLabel}</span> : null}
          {option.raceLabel && option.classLabel ? <span aria-hidden="true"> | </span> : null}
          {option.classLabel ? <span>{option.classLabel}</span> : null}
          {(option.raceLabel || option.classLabel) && option.level ? <span aria-hidden="true"> | </span> : null}
          {option.level ? <span>{t('pages.characterEdit.fields.level')} {option.level}</span> : null}
        </p>
      </div>
    </article>
  )
}

const NpcCard = ({ card }: { card: ContextNpcCardViewModel }) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.heroName,
    card.isElite ? styles.npcNameElite : '',
    card.isMinion ? styles.npcNameMinion : '',
    card.isNormal ? styles.npcNameNormal : '',
    card.isSolo ? styles.npcNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={`${styles.heroCard} ${card.isDead ? styles.npcCardDead : ''}`}>
      <div className={styles.heroPortraitStack}>
        <img className={styles.heroPortraitCustom} src={card.imageSrc} alt="" aria-hidden="true" />
      </div>
      <div className={styles.heroSummary}>
        <h3 className={nameClassName}>
          {card.isElite ? <AppIcon className={styles.npcRoleIcon} name="crown" /> : null}
          {card.isMinion ? <AppIcon className={styles.npcRoleIcon} name="minion" /> : null}
          {card.isNormal ? <AppIcon className={styles.npcRoleIcon} name="minion" /> : null}
          {card.isSolo ? <AppIcon className={styles.npcRoleIcon} name="crown" /> : null}
          <span>{card.label}</span>
        </h3>
        {card.isStory ? (
          <p className={styles.heroMeta}>{card.storyLabel}</p>
        ) : (
          <p className={styles.heroMeta}>
            {card.roleLabel ? <span>{card.roleLabel}</span> : null}
            {card.roleLabel && card.level ? <span aria-hidden="true"> | </span> : null}
            {card.level ? <span>{t('pages.npcEdit.fields.level')} {card.level}</span> : null}
            {(card.roleLabel || card.level) && card.typeLabel ? <span aria-hidden="true"> | </span> : null}
            {card.typeLabel ? <span>{card.typeLabel}</span> : null}
          </p>
        )}
      </div>
      <button
        type="button"
        className={styles.heroRemoveButton}
        aria-label={t('pages.contextEdit.npcGroups.removeNpcButton')}
        title={t('pages.contextEdit.npcGroups.removeNpcButton')}
        onClick={card.onRemoveClick}
      >
        <AppIcon name="trash" />
      </button>
    </article>
  )
}

const NpcGroupSection = ({ section }: { section: ContextNpcGroupSectionViewModel }) => {
  const { t } = useI18n()
  return (
    <section className={styles.npcGroupSection}>
      <div className={styles.npcGroupSectionHeader}>
        <h3 className={styles.npcGroupSectionTitle}>{section.name}</h3>
        <button
          type="button"
          className={styles.heroRemoveButton}
          aria-label={t('pages.contextEdit.npcGroups.removeGroupButton')}
          title={t('pages.contextEdit.npcGroups.removeGroupButton')}
          onClick={section.onRemoveGroupClick}
        >
          <AppIcon name="trash" />
        </button>
      </div>
      {section.npcs.length > 0 ? (
        <div className={styles.heroGrid}>
          {section.npcs.map((npc) => <NpcCard key={npc.id} card={npc} />)}
        </div>
      ) : (
        <p className={styles.emptyText}>{t('pages.contextEdit.npcGroups.groupEmpty')}</p>
      )}
    </section>
  )
}

const MonsterCard = ({ card }: { card: ContextMonsterCardViewModel }) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.heroName,
    card.isElite ? styles.npcNameElite : '',
    card.isMinion ? styles.npcNameMinion : '',
    card.isNormal ? styles.npcNameNormal : '',
    card.isSolo ? styles.npcNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={styles.heroCard}>
      <div className={styles.heroPortraitStack}>
        <img className={styles.heroPortraitCustom} src={card.imageSrc} alt="" aria-hidden="true" />
      </div>
      <div className={styles.heroSummary}>
        <h3 className={nameClassName}>
          {card.isElite ? <AppIcon className={styles.npcRoleIcon} name="crown" /> : null}
          {card.isMinion ? <AppIcon className={styles.npcRoleIcon} name="minion" /> : null}
          {card.isNormal ? <AppIcon className={styles.npcRoleIcon} name="minion" /> : null}
          {card.isSolo ? <AppIcon className={styles.npcRoleIcon} name="crown" /> : null}
          <span>{card.label}</span>
        </h3>
        <p className={styles.heroMeta}>
          {card.roleLabel ? <span>{card.roleLabel}</span> : null}
          {card.roleLabel && card.level ? <span aria-hidden="true"> | </span> : null}
          {card.level ? <span>{t('pages.monsterEdit.fields.level')} {card.level}</span> : null}
          {(card.roleLabel || card.level) && card.typeLabel ? <span aria-hidden="true"> | </span> : null}
          {card.typeLabel ? <span>{card.typeLabel}</span> : null}
        </p>
      </div>
      <button
        type="button"
        className={styles.heroRemoveButton}
        aria-label={t('pages.contextEdit.monsterGroups.removeMonsterButton')}
        title={t('pages.contextEdit.monsterGroups.removeMonsterButton')}
        onClick={card.onRemoveClick}
      >
        <AppIcon name="trash" />
      </button>
    </article>
  )
}

const MonsterGroupSection = ({ section }: { section: ContextMonsterGroupSectionViewModel }) => {
  const { t } = useI18n()
  return (
    <section className={styles.npcGroupSection}>
      <div className={styles.npcGroupSectionHeader}>
        <h3 className={styles.npcGroupSectionTitle}>{section.name}</h3>
        <button
          type="button"
          className={styles.heroRemoveButton}
          aria-label={t('pages.contextEdit.monsterGroups.removeGroupButton')}
          title={t('pages.contextEdit.monsterGroups.removeGroupButton')}
          onClick={section.onRemoveGroupClick}
        >
          <AppIcon name="trash" />
        </button>
      </div>
      {section.monsters.length > 0 ? (
        <div className={styles.heroGrid}>
          {section.monsters.map((monster) => <MonsterCard key={monster.id} card={monster} />)}
        </div>
      ) : (
        <p className={styles.emptyText}>{t('pages.contextEdit.monsterGroups.groupEmpty')}</p>
      )}
    </section>
  )
}

const MonsterGroupOption = ({ option }: { option: ContextMonsterGroupOptionViewModel }) => {
  return (
    <article
      className={`${styles.heroOption} ${option.selected ? styles.heroOptionSelected : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={option.selected}
      onClick={option.onToggleSelected}
      onKeyDown={option.onKeyDown}
    >
      <span className={styles.heroOptionCheckbox} aria-hidden="true">
        {option.selected ? <AppIcon name="check" /> : null}
      </span>
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{option.label}</h3>
        <p className={styles.heroMeta}>{option.monsterCountLabel}</p>
      </div>
    </article>
  )
}

const NpcGroupOption = ({ option }: { option: ContextNpcGroupOptionViewModel }) => {
  return (
    <article
      className={`${styles.heroOption} ${option.selected ? styles.heroOptionSelected : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={option.selected}
      onClick={option.onToggleSelected}
      onKeyDown={option.onKeyDown}
    >
      <span className={styles.heroOptionCheckbox} aria-hidden="true">
        {option.selected ? <AppIcon name="check" /> : null}
      </span>
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{option.label}</h3>
        <p className={styles.heroMeta}>{option.npcCountLabel}</p>
      </div>
    </article>
  )
}

export const ContextEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const {
    error,
    form,
    handleChange,
    handleSubmit,
    hasChanges,
    loading,
    saving,
    characterCards,
    characterOptions,
    characterSearch,
    handleChangeCharacterSearch,
    isAddCharacterDialogOpen,
    handleOpenAddCharacterDialog,
    handleCloseAddCharacterDialog,
    handleConfirmAddCharacters,
    hasSelectedCharactersInDialog,
    npcGroupSections,
    npcGroupOptions,
    npcGroupSearch,
    handleChangeNpcGroupSearch,
    isAddNpcGroupDialogOpen,
    handleOpenAddNpcGroupDialog,
    handleCloseAddNpcGroupDialog,
    handleConfirmAddNpcGroups,
    hasSelectedNpcGroupsInDialog,
    monsterGroupSections,
    monsterGroupOptions,
    monsterGroupSearch,
    handleChangeMonsterGroupSearch,
    isAddMonsterGroupDialogOpen,
    handleOpenAddMonsterGroupDialog,
    handleCloseAddMonsterGroupDialog,
    handleConfirmAddMonsterGroups,
    hasSelectedMonsterGroupsInDialog,
  } = useContextEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }
    handleTabChange('contexts')
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('contexts')
    navigate('/')
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIconFrame}>
              <AppIcon className={styles.headerIcon} name="document" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.contextEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="context-name">
                <span className={styles.srOnly}>{t('pages.contextEdit.fields.name')}</span>
                <input className={styles.titleInput} id="context-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder={t('pages.contextEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to="/" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="context-edit-form" type="submit" disabled={saving || !hasChanges}>
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
          <p className={styles.loadingText}>{t('pages.contextEdit.loading')}</p>
        ) : (
          <form id="context-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <section className={styles.section}>
              <label className={styles.field} htmlFor="context-description">
                <span className={styles.fieldLabel}>{t('pages.contextEdit.fields.description')}</span>
                <textarea className={styles.descriptionTextarea} id="context-description" name="description" value={form.description} onChange={handleChange} placeholder={t('pages.contextEdit.placeholders.description')} />
              </label>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.contextEdit.characters.title')}</h2>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenAddCharacterDialog}
                >
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.contextEdit.characters.addButton')}</span>
                  </span>
                </button>
              </div>
              {characterCards.length > 0 ? (
                <div className={styles.heroGrid}>
                  {characterCards.map((card) => (
                    <HeroCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('pages.contextEdit.characters.emptyState')}</p>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.contextEdit.npcGroups.title')}</h2>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenAddNpcGroupDialog}
                >
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.contextEdit.npcGroups.addButton')}</span>
                  </span>
                </button>
              </div>
              {npcGroupSections.length > 0 ? (
                <div className={styles.npcGroupList}>
                  {npcGroupSections.map((section) => (
                    <NpcGroupSection key={section.id} section={section} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('pages.contextEdit.npcGroups.emptyState')}</p>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.contextEdit.monsterGroups.title')}</h2>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenAddMonsterGroupDialog}
                >
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.contextEdit.monsterGroups.addButton')}</span>
                  </span>
                </button>
              </div>
              {monsterGroupSections.length > 0 ? (
                <div className={styles.npcGroupList}>
                  {monsterGroupSections.map((section) => (
                    <MonsterGroupSection key={section.id} section={section} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('pages.contextEdit.monsterGroups.emptyState')}</p>
              )}
            </section>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />

        {isAddCharacterDialogOpen ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="context-add-characters-title">
              <h2 className={styles.dialogTitle} id="context-add-characters-title">
                {t('pages.contextEdit.characters.addDialog.title')}
              </h2>
              <input
                className={styles.dialogSearch}
                type="text"
                value={characterSearch}
                placeholder={t('pages.contextEdit.characters.addDialog.searchPlaceholder')}
                aria-label={t('pages.contextEdit.characters.addDialog.searchLabel')}
                autoComplete="off"
                onChange={(event) => handleChangeCharacterSearch(event.target.value)}
              />
              <div className={styles.dialogList}>
                {characterOptions.length > 0 ? (
                  characterOptions.map((option) => <HeroOption key={option.id} option={option} />)
                ) : (
                  <p className={styles.emptyText}>{t('pages.contextEdit.characters.addDialog.emptyState')}</p>
                )}
              </div>
              <div className={styles.dialogActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleCloseAddCharacterDialog}>
                  {t('common.actions.cancel')}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleConfirmAddCharacters}
                  disabled={!hasSelectedCharactersInDialog}
                >
                  {t('pages.contextEdit.characters.addDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isAddMonsterGroupDialogOpen ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="context-add-monster-groups-title">
              <h2 className={styles.dialogTitle} id="context-add-monster-groups-title">
                {t('pages.contextEdit.monsterGroups.addDialog.title')}
              </h2>
              <input
                className={styles.dialogSearch}
                type="text"
                value={monsterGroupSearch}
                placeholder={t('pages.contextEdit.monsterGroups.addDialog.searchPlaceholder')}
                aria-label={t('pages.contextEdit.monsterGroups.addDialog.searchLabel')}
                autoComplete="off"
                onChange={(event) => handleChangeMonsterGroupSearch(event.target.value)}
              />
              <div className={styles.dialogList}>
                {monsterGroupOptions.length > 0 ? (
                  monsterGroupOptions.map((option) => <MonsterGroupOption key={option.id} option={option} />)
                ) : (
                  <p className={styles.emptyText}>{t('pages.contextEdit.monsterGroups.addDialog.emptyState')}</p>
                )}
              </div>
              <div className={styles.dialogActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleCloseAddMonsterGroupDialog}>
                  {t('common.actions.cancel')}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleConfirmAddMonsterGroups}
                  disabled={!hasSelectedMonsterGroupsInDialog}
                >
                  {t('pages.contextEdit.monsterGroups.addDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isAddNpcGroupDialogOpen ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="context-add-npc-groups-title">
              <h2 className={styles.dialogTitle} id="context-add-npc-groups-title">
                {t('pages.contextEdit.npcGroups.addDialog.title')}
              </h2>
              <input
                className={styles.dialogSearch}
                type="text"
                value={npcGroupSearch}
                placeholder={t('pages.contextEdit.npcGroups.addDialog.searchPlaceholder')}
                aria-label={t('pages.contextEdit.npcGroups.addDialog.searchLabel')}
                autoComplete="off"
                onChange={(event) => handleChangeNpcGroupSearch(event.target.value)}
              />
              <div className={styles.dialogList}>
                {npcGroupOptions.length > 0 ? (
                  npcGroupOptions.map((option) => <NpcGroupOption key={option.id} option={option} />)
                ) : (
                  <p className={styles.emptyText}>{t('pages.contextEdit.npcGroups.addDialog.emptyState')}</p>
                )}
              </div>
              <div className={styles.dialogActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleCloseAddNpcGroupDialog}>
                  {t('common.actions.cancel')}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleConfirmAddNpcGroups}
                  disabled={!hasSelectedNpcGroupsInDialog}
                >
                  {t('pages.contextEdit.npcGroups.addDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
