import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListCard } from './CharacterListCard'
import { CharacterListHeader } from './CharacterListHeader'
import styles from './style.module.scss'
import type { CharacterGroupCardViewModel, CharacterListPageState, CreateCharacterGroupDialogProps } from './types'
import { useCharacterListPage } from './characterListPageStateHooks'

const CharacterGroupCard = ({ group }: { group: CharacterGroupCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.groupCard} role="link" tabIndex={0} onClick={group.onOpen} onKeyDown={group.onKeyDown}>
      <div className={styles.groupSummary}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupName}>{group.name}</h2>
          <p className={styles.groupId}>
            {t('pages.characterList.groups.characterCount', { count: group.characterCount })}
          </p>
        </div>
        {group.characterThumbnails.length > 0 ? (
          <div className={styles.groupThumbnails}>
            {group.characterThumbnails.map((character) => (
              <div className={styles.groupThumbnailItem} key={`${group.id}-${character.id}`} role="link" tabIndex={0} onClick={character.onOpen} onKeyDown={character.onKeyDown}>
                <span className={styles.groupThumbnailName} title={character.label}>{character.label}</span>
                <div className={`${styles.groupPortraitStack} ${character.imageSrc ? styles.groupPortraitStackCustomImage : styles.groupPortraitStackDefaultImage}`}>
                  {character.imageSrc ? (
                    <img className={styles.groupCustomPortrait} src={character.imageSrc} alt={character.label} title={character.label} onError={character.onImageError} />
                  ) : (
                    <>
                      <img className={styles.groupPortrait} src={character.portraitSrc} alt="" aria-hidden="true" onError={character.onImageError} />
                      <img className={styles.groupClass} src={character.classSrc} alt={character.label} title={character.label} onError={character.onImageError} />
                    </>
                  )}
                </div>
              </div>
            ))}
            {group.hasMoreCharacters ? <span className={styles.groupThumbnailMore} aria-label={t('pages.characterList.groups.moreCharacters')}>...</span> : null}
          </div>
        ) : <p className={styles.groupEmptyText}>{t('pages.characterList.groups.emptyCharacters')}</p>}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={group.onDeleteClick} disabled={group.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

const CreateCharacterGroupDialog = ({
  creatingGroup,
  groupName,
  onCancel,
  onChangeGroupName,
  onSubmit,
}: CreateCharacterGroupDialogProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.backdrop} role="presentation">
      <form className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-character-group-title" onSubmit={onSubmit}>
        <h2 className={styles.dialogTitle} id="create-character-group-title">
          {t('pages.characterList.groups.createDialog.title')}
        </h2>
        <label className={styles.field} htmlFor="character-group-name">
          <span className={styles.fieldLabel}>{t('pages.characterList.groups.createDialog.nameLabel')}</span>
          <input className={styles.input} id="character-group-name" name="name" value={groupName} placeholder={t('pages.characterList.groups.createDialog.namePlaceholder')} required autoFocus onChange={(event) => onChangeGroupName(event.target.value)} />
        </label>
        <div className={styles.dialogActions}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={creatingGroup}>
            {t('common.actions.cancel')}
          </button>
          <button className={styles.primaryButton} type="submit" disabled={creatingGroup || !groupName.trim()}>
            {creatingGroup ? t('common.states.creating') : t('common.actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

const CharacterListPageContent = ({
  activeTab,
  cards,
  creating,
  creatingGroup,
  deletingId,
  deleteDialogCharacterName,
  deleteDialogGroupName,
  error,
  groupDeletingId,
  groupName,
  groups,
  groupToDelete,
  handleCancelCreateGroup,
  handleCardImageError,
  handleChangeGroupName,
  loading,
  loadingGroups,
  characterToDelete,
  handleCloseDeleteDialog,
  handleCloseDeleteGroupDialog,
  handleConfirmDeleteCharacter,
  handleConfirmDeleteCharacterGroup,
  handleCreateGroupSubmit,
  handleCreateCharacter,
  handleOpenCreateGroupDialog,
  setActiveTab,
  showCharacterGrid,
  showCreateGroupDialog,
  showEmptyGroupsState,
  showEmptyState,
  showGroupList,
}: CharacterListPageState) => {
  const { t } = useI18n()
  return (
    <>
      <CharacterListHeader actionLabel={t('pages.characterList.actions.addHero')} creating={creating} secondaryActionLabel={t('pages.characterList.actions.addGroup')} secondaryCreating={creatingGroup} onAction={() => void handleCreateCharacter()} onSecondaryAction={handleOpenCreateGroupDialog} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.heroes')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      <div className={styles.tabsContainer}>
        <div className={styles.characterTabs} role="tablist" aria-label={t('pages.main.tabs.heroes')}>
          <button className={`${styles.characterTabButton} ${activeTab === 'groups' ? styles.characterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
            {t('pages.characterList.tabs.groups')}
          </button>
          <button className={`${styles.characterTabButton} ${activeTab === 'list' ? styles.characterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
            {t('pages.characterList.tabs.list')}
          </button>
        </div>

        {activeTab === 'groups' ? (
          <>
            {loadingGroups ? (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>{t('pages.characterList.groups.loading')}</p>
              </section>
            ) : null}
            {showEmptyGroupsState ? (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>{t('pages.characterList.groups.emptyState')}</p>
              </section>
            ) : null}
            {showGroupList ? (
              <section className={styles.groupList} aria-label={t('pages.characterList.tabs.groups')}>
                {groups.map((group) => (
                  <CharacterGroupCard key={group.id} group={group} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}

        {activeTab === 'list' ? (
          <>
            {loading ? (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>{t('common.states.loadingCards')}</p>
              </section>
            ) : null}
            {showEmptyState ? (
              <section className={styles.emptyState}>
                <p className={styles.emptyText}>{t('pages.characterList.emptyState')}</p>
              </section>
            ) : null}
            {showCharacterGrid ? (
              <section className={styles.characterGrid} aria-label={t('pages.main.tabs.heroes')}>
                {cards.map((card) => (<CharacterListCard key={card.id} card={card} onImageError={handleCardImageError} />))}
              </section>
            ) : null}
          </>
        ) : null}
      </div>

      {showCreateGroupDialog ? <CreateCharacterGroupDialog creatingGroup={creatingGroup} groupName={groupName} onCancel={handleCancelCreateGroup} onChangeGroupName={handleChangeGroupName} onSubmit={handleCreateGroupSubmit} /> : null}
      <DeleteCharacterDialog characterName={deleteDialogCharacterName} deleting={deletingId === characterToDelete?.id} open={Boolean(characterToDelete)} onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteCharacter()} />
      <DeleteCharacterDialog bodyKey="pages.characterList.groups.deleteDialog.body" characterName={deleteDialogGroupName} deleting={groupDeletingId === groupToDelete?.id} open={Boolean(groupToDelete)} titleKey="pages.characterList.groups.deleteDialog.title" onCancel={handleCloseDeleteGroupDialog} onConfirm={() => void handleConfirmDeleteCharacterGroup()} />
    </>
  )
}

export const CharacterListPage = () => {
  const page = useCharacterListPage()
  return <CharacterListPageContent {...page} />
}
