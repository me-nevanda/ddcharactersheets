import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useContextEditPage } from './contextEditPageHooks'
import type {
  ContextAreaOptionViewModel,
  ContextAreaSectionViewModel,
  ContextCharacterCardViewModel,
  ContextCharacterOptionViewModel,
  ContextMonsterCardViewModel,
  ContextEventCardViewModel,
  ContextEventOptionViewModel,
  ContextMonsterGroupOptionViewModel,
  ContextMonsterGroupSectionViewModel,
  ContextNpcCardViewModel,
  ContextNpcGroupOptionViewModel,
  ContextNpcGroupSectionViewModel,
  ContextPlaceCardViewModel,
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

const EventCard = ({ card }: { card: ContextEventCardViewModel }) => {
  const { t } = useI18n()
  return (
    <article className={styles.heroCard}>
      <div className={styles.placeIconFrame} aria-hidden="true">
        <AppIcon name="event" />
      </div>
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{card.label}</h3>
        {card.descriptionPreview ? (
          <p className={styles.heroMeta}>{card.descriptionPreview}</p>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.heroRemoveButton}
        aria-label={t('pages.contextEdit.events.removeButton')}
        title={t('pages.contextEdit.events.removeButton')}
        onClick={card.onRemoveClick}
      >
        <AppIcon name="trash" />
      </button>
    </article>
  )
}

const EventOption = ({ option }: { option: ContextEventOptionViewModel }) => {
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
      <div className={styles.placeIconFrame} aria-hidden="true">
        <AppIcon name="event" />
      </div>
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{option.label}</h3>
        {option.descriptionPreview ? (
          <p className={styles.heroMeta}>{option.descriptionPreview}</p>
        ) : null}
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

const PlaceCard = ({ card }: { card: ContextPlaceCardViewModel }) => {
  const { t } = useI18n()
  return (
    <article className={styles.heroCard}>
      <div className={styles.placeIconFrame} aria-hidden="true">
        <AppIcon name="area" />
      </div>
      <div className={styles.heroSummary}>
        <h3 className={styles.heroName}>{card.label}</h3>
        {card.descriptionPreview ? (
          <p className={styles.heroMeta}>{card.descriptionPreview}</p>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.heroRemoveButton}
        aria-label={t('pages.contextEdit.areas.removePlaceButton')}
        title={t('pages.contextEdit.areas.removePlaceButton')}
        onClick={card.onRemoveClick}
      >
        <AppIcon name="trash" />
      </button>
    </article>
  )
}

const AreaSection = ({ section }: { section: ContextAreaSectionViewModel }) => {
  const { t } = useI18n()
  return (
    <section className={styles.npcGroupSection}>
      <div className={styles.npcGroupSectionHeader}>
        <h3 className={styles.npcGroupSectionTitle}>{section.name}</h3>
        <button
          type="button"
          className={styles.heroRemoveButton}
          aria-label={t('pages.contextEdit.areas.removeAreaButton')}
          title={t('pages.contextEdit.areas.removeAreaButton')}
          onClick={section.onRemoveAreaClick}
        >
          <AppIcon name="trash" />
        </button>
      </div>
      {section.places.length > 0 ? (
        <div className={styles.heroGrid}>
          {section.places.map((place) => <PlaceCard key={place.id} card={place} />)}
        </div>
      ) : (
        <p className={styles.emptyText}>{t('pages.contextEdit.areas.areaEmpty')}</p>
      )}
    </section>
  )
}

const AreaOption = ({ option }: { option: ContextAreaOptionViewModel }) => {
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
        <p className={styles.heroMeta}>{option.placeCountLabel}</p>
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
    copyingContext,
    form,
    handleChange,
    handleCopyContext,
    handleImageChange,
    handleImageRemove,
    handleSubmit,
    hasChanges,
    imageUrl,
    loading,
    removingImage,
    saving,
    uploadingImage,
    characterCards,
    characterOptions,
    characterSearch,
    handleChangeCharacterSearch,
    isAddCharacterDialogOpen,
    handleOpenAddCharacterDialog,
    handleCloseAddCharacterDialog,
    handleConfirmAddCharacters,
    hasSelectedCharactersInDialog,
    eventCards,
    eventOptions,
    eventSearch,
    handleChangeEventSearch,
    isAddEventDialogOpen,
    handleOpenAddEventDialog,
    handleCloseAddEventDialog,
    handleConfirmAddEvents,
    hasSelectedEventsInDialog,
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
    handleChangeDescription,
    areaSections,
    areaOptions,
    areaSearch,
    handleChangeAreaSearch,
    isAddAreaDialogOpen,
    handleOpenAddAreaDialog,
    handleCloseAddAreaDialog,
    handleConfirmAddAreas,
    hasSelectedAreasInDialog,
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
            <div className={`${styles.headerImagePicker} ${imageUrl ? styles.headerImagePickerWithImage : ''}`}>
              <input id="context-image-input" className={styles.headerImageInput} type="file" accept="image/png,image/jpeg" onChange={(event) => void handleImageChange(event)} disabled={uploadingImage || removingImage} />
              {imageUrl ? (
                <>
                  <img className={styles.headerImage} src={imageUrl} alt={t('pages.contextEdit.fields.image')} />
                  <div className={styles.headerImageActions}>
                    <label className={styles.headerImageAction} htmlFor="context-image-input" aria-disabled={uploadingImage || removingImage}>
                      <AppIcon name="edit" />
                      <span>{t('pages.contextEdit.imageActions.uploadNew')}</span>
                    </label>
                    <button className={`${styles.headerImageAction} ${styles.headerImageDangerAction}`} type="button" disabled={uploadingImage || removingImage} onClick={() => void handleImageRemove()}>
                      <AppIcon name="trash" />
                      <span>{t('pages.contextEdit.imageActions.remove')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.headerImagePlaceholder} htmlFor="context-image-input">
                  {t('pages.contextEdit.placeholders.image')}
                </label>
              )}
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
              <button className={styles.secondaryButton} type="button" onClick={() => void handleCopyContext()} disabled={saving || copyingContext}>
                <span className={styles.buttonContent}>
                  <AppIcon name="document" />
                  <span>{copyingContext ? t('pages.contextEdit.copyingButton') : t('pages.contextEdit.copyButton')}</span>
                </span>
              </button>
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
              <div className={styles.field}>
                <span className={styles.fieldLabel}>{t('pages.contextEdit.fields.description')}</span>
                <SimpleWysiwygEditor
                  ariaLabel={t('pages.contextEdit.fields.description')}
                  minHeightClassName={styles.descriptionEditor}
                  name="description"
                  onChange={handleChangeDescription}
                  placeholder={t('pages.contextEdit.placeholders.description')}
                  toolbar={false}
                  value={form.description}
                />
              </div>
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

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.contextEdit.areas.title')}</h2>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenAddAreaDialog}
                >
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.contextEdit.areas.addButton')}</span>
                  </span>
                </button>
              </div>
              {areaSections.length > 0 ? (
                <div className={styles.npcGroupList}>
                  {areaSections.map((section) => (
                    <AreaSection key={section.id} section={section} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('pages.contextEdit.areas.emptyState')}</p>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{t('pages.contextEdit.events.title')}</h2>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handleOpenAddEventDialog}
                >
                  <span className={styles.buttonContent}>
                    <AppIcon name="plus" />
                    <span>{t('pages.contextEdit.events.addButton')}</span>
                  </span>
                </button>
              </div>
              {eventCards.length > 0 ? (
                <div className={styles.heroGrid}>
                  {eventCards.map((card) => (
                    <EventCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('pages.contextEdit.events.emptyState')}</p>
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

        {isAddEventDialogOpen ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="context-add-events-title">
              <h2 className={styles.dialogTitle} id="context-add-events-title">
                {t('pages.contextEdit.events.addDialog.title')}
              </h2>
              <input
                className={styles.dialogSearch}
                type="text"
                value={eventSearch}
                placeholder={t('pages.contextEdit.events.addDialog.searchPlaceholder')}
                aria-label={t('pages.contextEdit.events.addDialog.searchLabel')}
                autoComplete="off"
                onChange={(event) => handleChangeEventSearch(event.target.value)}
              />
              <div className={styles.dialogList}>
                {eventOptions.length > 0 ? (
                  eventOptions.map((option) => <EventOption key={option.id} option={option} />)
                ) : (
                  <p className={styles.emptyText}>{t('pages.contextEdit.events.addDialog.emptyState')}</p>
                )}
              </div>
              <div className={styles.dialogActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleCloseAddEventDialog}>
                  {t('common.actions.cancel')}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleConfirmAddEvents}
                  disabled={!hasSelectedEventsInDialog}
                >
                  {t('pages.contextEdit.events.addDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isAddAreaDialogOpen ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="context-add-areas-title">
              <h2 className={styles.dialogTitle} id="context-add-areas-title">
                {t('pages.contextEdit.areas.addDialog.title')}
              </h2>
              <input
                className={styles.dialogSearch}
                type="text"
                value={areaSearch}
                placeholder={t('pages.contextEdit.areas.addDialog.searchPlaceholder')}
                aria-label={t('pages.contextEdit.areas.addDialog.searchLabel')}
                autoComplete="off"
                onChange={(event) => handleChangeAreaSearch(event.target.value)}
              />
              <div className={styles.dialogList}>
                {areaOptions.length > 0 ? (
                  areaOptions.map((option) => <AreaOption key={option.id} option={option} />)
                ) : (
                  <p className={styles.emptyText}>{t('pages.contextEdit.areas.addDialog.emptyState')}</p>
                )}
              </div>
              <div className={styles.dialogActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleCloseAddAreaDialog}>
                  {t('common.actions.cancel')}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleConfirmAddAreas}
                  disabled={!hasSelectedAreasInDialog}
                >
                  {t('pages.contextEdit.areas.addDialog.confirm')}
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
