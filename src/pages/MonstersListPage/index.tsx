import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
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
              <div className={styles.groupThumbnailItem} key={`${group.id}-${monster.label}-${monster.imageSrc}`}>
                <span className={styles.groupThumbnailName} title={monster.label}>{monster.label}</span>
                <img className={styles.groupThumbnail} src={monster.imageSrc} alt={monster.label} title={monster.label} />
              </div>
            ))}
            {group.hasMoreMonsters ? <span className={styles.groupThumbnailMore} aria-label={t('pages.monsterList.groups.moreMonsters')}>...</span> : null}
          </div>
        ) : <p className={styles.groupEmptyText}>{t('pages.monsterList.groups.emptyMonsters')}</p>}
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
  const { activeTab, cards, creating, creatingGroup, deletingId, deleteDialogMonsterName, error, groupName, groups, handleCancelCreateGroup, handleChangeGroupName, handleCloseDeleteDialog, handleConfirmDeleteMonster, handleCreateGroupSubmit, handleCreateMonster, handleOpenCreateGroupDialog, loading, loadingGroups, monsterToDelete, setActiveTab, showCreateGroupDialog, showEmptyGroupsState, showEmptyState, showGroupList, showMonsterGrid } = useMonstersListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.characterList.actions.addMonster')} creating={creating} secondaryActionLabel={t('pages.monsterList.actions.addGroup')} secondaryCreating={creatingGroup} onAction={() => void handleCreateMonster()} onSecondaryAction={handleOpenCreateGroupDialog} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.monsters')} />
      <div className={styles.monsterTabs} role="tablist" aria-label={t('pages.main.tabs.monsters')}>
        <button className={`${styles.monsterTabButton} ${activeTab === 'groups' ? styles.monsterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
          {t('pages.monsterList.tabs.groups')}
        </button>
        <button className={`${styles.monsterTabButton} ${activeTab === 'list' ? styles.monsterTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          {t('pages.monsterList.tabs.list')}
        </button>
      </div>
      {error ? <p className={styles.status}>{error}</p> : null}
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
          {showMonsterGrid ? (
            <section className={styles.monsterGrid} aria-label={t('pages.main.tabs.monsters')}>
              {cards.map((card) => (
                <MonsterListCard key={card.id} card={card} />
              ))}
            </section>
          ) : null}
        </>
      ) : null}
      {showCreateGroupDialog ? <CreateMonsterGroupDialog creatingGroup={creatingGroup} groupName={groupName} onCancel={handleCancelCreateGroup} onChangeGroupName={handleChangeGroupName} onSubmit={handleCreateGroupSubmit} /> : null}
      <DeleteCharacterDialog bodyKey="pages.monsterList.deleteDialog.body" characterName={deleteDialogMonsterName} deleting={deletingId === monsterToDelete?.id} open={Boolean(monsterToDelete)} titleKey="pages.monsterList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteMonster()} />
    </>
  )
}
