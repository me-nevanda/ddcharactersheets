import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useStickySentinel } from '@pages/useStickyStateHooks'
import { useMonstersListPage } from './monstersListPageHooks'
import type { CreateMonsterGroupDialogProps, MonsterGroupCardViewModel, MonsterListCardViewModel } from './types'
import styles from './style.module.scss'

const MonsterListCard = ({ card }: { card: MonsterListCardViewModel }) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.monsterName,
    card.isElite ? styles.monsterNameElite : '',
    card.isMinion ? styles.monsterNameMinion : '',
    card.isNormal ? styles.monsterNameNormal : '',
    card.isSolo ? styles.monsterNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={styles.monsterCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardBody}>
        <div className={styles.monsterImageFrame}>
          <img className={styles.monsterImage} src={card.imageSrc} alt="" aria-hidden="true" />
        </div>
        <div className={styles.monsterSummary}>
          <h2 className={nameClassName}>
            {card.isElite ? <AppIcon className={styles.eliteIcon} name="crown" /> : null}
            {card.isMinion ? <AppIcon className={styles.minionIcon} name="minion" /> : null}
            {card.isNormal ? <AppIcon className={styles.normalIcon} name="minion" /> : null}
            {card.isSolo ? <AppIcon className={styles.soloIcon} name="crown" /> : null}
            <span>{card.label}</span>
          </h2>
          <div className={styles.cardMeta}>
            <span className={styles.cardMetaItem}>{card.roleLabel}</span>
            <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
            <span className={styles.cardMetaItem}>
              {t('pages.monsterEdit.fields.level')} {card.level}
            </span>
            <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
            <span className={styles.cardMetaItem}>{card.typeLabel}</span>
          </div>
          {card.descriptionPreview ? <p className={styles.monsterDescription}>{card.descriptionPreview}</p> : null}
        </div>
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={card.onDeleteClick} disabled={card.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

const MonsterGroupCard = ({ group }: { group: MonsterGroupCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.groupCard} role="link" tabIndex={0} onClick={group.onOpen} onKeyDown={group.onKeyDown}>
      <div className={styles.groupSummary}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupName}>{group.name}</h2>
          <p className={styles.groupId}>
            {t('pages.monsterList.groups.monsterCount', { count: group.monsterCount })}
          </p>
        </div>
        {group.monsterThumbnails.length > 0 ? (
          <div className={styles.groupThumbnails}>
            {group.monsterThumbnails.map((monster) => (
              <div className={styles.groupThumbnailItem} key={`${group.id}-${monster.id}`} role="link" tabIndex={0} onClick={monster.onOpen} onKeyDown={monster.onKeyDown}>
                <span className={styles.groupThumbnailName} title={monster.label}>{monster.label}</span>
                <img className={styles.groupThumbnail} src={monster.imageSrc} alt={monster.label} title={monster.label} />
              </div>
            ))}
            {group.hasMoreMonsters ? <span className={styles.groupThumbnailMore} aria-label={t('pages.monsterList.groups.moreMonsters')}>...</span> : null}
          </div>
        ) : <p className={styles.groupEmptyText}>{t('pages.monsterList.groups.emptyMonsters')}</p>}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={group.onDeleteClick} disabled={group.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

const CreateMonsterGroupDialog = ({
  creatingGroup,
  groupName,
  onCancel,
  onChangeGroupName,
  onSubmit,
}: CreateMonsterGroupDialogProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.backdrop} role="presentation">
      <form className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-monster-group-title" onSubmit={onSubmit}>
        <h2 className={styles.dialogTitle} id="create-monster-group-title">
          {t('pages.monsterList.groups.createDialog.title')}
        </h2>
        <label className={styles.field} htmlFor="monster-group-name">
          <span className={styles.fieldLabel}>{t('pages.monsterList.groups.createDialog.nameLabel')}</span>
          <input className={styles.input} id="monster-group-name" name="name" value={groupName} placeholder={t('pages.monsterList.groups.createDialog.namePlaceholder')} required autoFocus onChange={(event) => onChangeGroupName(event.target.value)} />
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

export const MonstersListPage = () => {
  const { t } = useI18n()
  const { isSticky, sentinelRef } = useStickySentinel()
  const { activeTab, cards, creating, creatingGroup, deleteDialogGroupName, deletingId, deleteDialogMonsterName, error, groupDeletingId, groupName, groupSearch, groups, groupToDelete, handleCancelCreateGroup, handleChangeGroupName, handleChangeGroupSearch, handleChangeListSearch, handleCloseDeleteDialog, handleCloseDeleteGroupDialog, handleConfirmDeleteMonster, handleConfirmDeleteMonsterGroup, handleCreateGroupSubmit, handleCreateMonster, handleOpenCreateGroupDialog, listSearch, loading, loadingGroups, monsterToDelete, setActiveTab, showCreateGroupDialog, showEmptyGroupsState, showEmptyGroupSearchState, showEmptySearchState, showEmptyState, showGroupList, showMonsterGrid } = useMonstersListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.characterList.actions.addMonster')} creating={creating} secondaryActionLabel={t('pages.monsterList.actions.addGroup')} secondaryCreating={creatingGroup} onAction={() => void handleCreateMonster()} onSecondaryAction={handleOpenCreateGroupDialog} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.monsters')} />
      {error ? <p className={styles.status}>{error}</p> : null}
      <div className={styles.tabsContainer}>
        <div ref={sentinelRef} className={styles.stickySentinel} aria-hidden="true" />
        <div className={`${styles.listToolbar} ${isSticky ? styles.listToolbarSticky : ''}`}>
          {activeTab === 'groups' && !loadingGroups ? (
            <label className={styles.tabSearchField} htmlFor="monster-group-search">
              <span className={styles.visuallyHidden}>{t('pages.monsterList.groups.searchLabel')}</span>
              <input className={styles.groupSearchInput} id="monster-group-search" value={groupSearch} placeholder={t('pages.monsterList.groups.searchPlaceholder')} autoComplete="off" onChange={(event) => handleChangeGroupSearch(event.target.value)} />
            </label>
          ) : activeTab === 'list' && !loading ? (
            <label className={styles.tabSearchField} htmlFor="monster-list-search">
              <span className={styles.visuallyHidden}>{t('pages.monsterList.searchLabel')}</span>
              <input className={styles.groupSearchInput} id="monster-list-search" value={listSearch} placeholder={t('pages.monsterList.searchPlaceholder')} autoComplete="off" onChange={(event) => handleChangeListSearch(event.target.value)} />
            </label>
          ) : <span aria-hidden="true" />}
          <div className={styles.monsterTabs} role="tablist" aria-label={t('pages.main.tabs.monsters')}>
            <button className={`${styles.monsterTabButton} ${activeTab === 'groups' ? styles.monsterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
              {t('pages.monsterList.tabs.groups')}
            </button>
            <button className={`${styles.monsterTabButton} ${activeTab === 'list' ? styles.monsterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
              {t('pages.monsterList.tabs.list')}
            </button>
          </div>
        </div>
        {activeTab === 'groups' ? (
          <>
            {loadingGroups ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.monsterList.groups.loading')}</p>
              </section>
            ) : null}
            {showEmptyGroupsState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.monsterList.groups.emptyState')}</p>
              </section>
            ) : null}
            {showEmptyGroupSearchState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.monsterList.groups.emptySearchState')}</p>
              </section>
            ) : null}
            {showGroupList ? (
              <section className={styles.groupList} aria-label={t('pages.monsterList.tabs.groups')}>
                {groups.map((group) => (
                  <MonsterGroupCard key={group.id} group={group} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}
        {activeTab === 'list' ? (
          <>
            {loading ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('common.states.loadingMonsters')}</p>
              </section>
            ) : null}
            {showEmptyState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.monsterList.emptyState')}</p>
              </section>
            ) : null}
            {showEmptySearchState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.monsterList.emptySearchState')}</p>
              </section>
            ) : null}
            {showMonsterGrid ? (
              <section className={styles.monsterGrid} aria-label={t('pages.main.tabs.monsters')}>
                {cards.map((card) => (
                  <MonsterListCard key={card.id} card={card} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}
      </div>
      {showCreateGroupDialog ? <CreateMonsterGroupDialog creatingGroup={creatingGroup} groupName={groupName} onCancel={handleCancelCreateGroup} onChangeGroupName={handleChangeGroupName} onSubmit={handleCreateGroupSubmit} /> : null}
      <DeleteCharacterDialog bodyKey="pages.monsterList.deleteDialog.body" characterName={deleteDialogMonsterName} deleting={deletingId === monsterToDelete?.id} open={Boolean(monsterToDelete)} titleKey="pages.monsterList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteMonster()} />
      <DeleteCharacterDialog bodyKey="pages.monsterList.groups.deleteDialog.body" characterName={deleteDialogGroupName} deleting={groupDeletingId === groupToDelete?.id} open={Boolean(groupToDelete)} titleKey="pages.monsterList.groups.deleteDialog.title" onCancel={handleCloseDeleteGroupDialog} onConfirm={() => void handleConfirmDeleteMonsterGroup()} />
    </>
  )
}
