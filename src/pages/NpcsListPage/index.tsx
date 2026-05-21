import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useNpcsListPage } from './npcsListPageHooks'
import type { CreateNpcGroupDialogProps, NpcGroupCardViewModel, NpcListCardViewModel } from './types'
import styles from './style.module.scss'

const NpcListCard = ({ card }: { card: NpcListCardViewModel }) => {
  const { t } = useI18n()
  const nameClassName = [
    styles.npcName,
    card.isElite ? styles.npcNameElite : '',
    card.isMinion ? styles.npcNameMinion : '',
    card.isNormal ? styles.npcNameNormal : '',
    card.isSolo ? styles.npcNameSolo : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={styles.npcCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardBody}>
        <div className={styles.npcImageFrame}>
          <img className={styles.npcImage} src={card.imageSrc} alt="" aria-hidden="true" />
        </div>
        <div className={styles.npcSummary}>
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
              {t('pages.npcEdit.fields.level')} {card.level}
            </span>
            <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
            <span className={styles.cardMetaItem}>{card.typeLabel}</span>
          </div>
          {card.descriptionPreview ? <p className={styles.npcDescription}>{card.descriptionPreview}</p> : null}
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

const NpcGroupCard = ({ group }: { group: NpcGroupCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.groupCard} role="link" tabIndex={0} onClick={group.onOpen} onKeyDown={group.onKeyDown}>
      <div className={styles.groupSummary}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupName}>{group.name}</h2>
          <p className={styles.groupId}>
            {t('pages.npcList.groups.npcCount', { count: group.npcCount })}
          </p>
        </div>
        {group.npcThumbnails.length > 0 ? (
          <div className={styles.groupThumbnails}>
            {group.npcThumbnails.map((npc) => (
              <div className={styles.groupThumbnailItem} key={`${group.id}-${npc.label}-${npc.imageSrc}`}>
                <span className={styles.groupThumbnailName} title={npc.label}>{npc.label}</span>
                <img className={styles.groupThumbnail} src={npc.imageSrc} alt={npc.label} title={npc.label} />
              </div>
            ))}
            {group.hasMoreNpcs ? <span className={styles.groupThumbnailMore} aria-label={t('pages.npcList.groups.moreNpcs')}>...</span> : null}
          </div>
        ) : <p className={styles.groupEmptyText}>{t('pages.npcList.groups.emptyNpcs')}</p>}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={group.onDeleteClick} disabled={group.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

const CreateNpcGroupDialog = ({
  creatingGroup,
  groupName,
  onCancel,
  onChangeGroupName,
  onSubmit,
}: CreateNpcGroupDialogProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.backdrop} role="presentation">
      <form className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-npc-group-title" onSubmit={onSubmit}>
        <h2 className={styles.dialogTitle} id="create-npc-group-title">
          {t('pages.npcList.groups.createDialog.title')}
        </h2>
        <label className={styles.field} htmlFor="npc-group-name">
          <span className={styles.fieldLabel}>{t('pages.npcList.groups.createDialog.nameLabel')}</span>
          <input className={styles.input} id="npc-group-name" name="name" value={groupName} placeholder={t('pages.npcList.groups.createDialog.namePlaceholder')} required autoFocus onChange={(event) => onChangeGroupName(event.target.value)} />
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

export const NpcsListPage = () => {
  const { t } = useI18n()
  const { activeTab, cards, creating, creatingGroup, deleteDialogGroupName, deletingId, deleteDialogNpcName, error, groupDeletingId, groupName, groups, groupToDelete, handleCancelCreateGroup, handleChangeGroupName, handleCloseDeleteDialog, handleCloseDeleteGroupDialog, handleConfirmDeleteNpc, handleConfirmDeleteNpcGroup, handleCreateGroupSubmit, handleCreateNpc, handleOpenCreateGroupDialog, loading, loadingGroups, npcToDelete, setActiveTab, showCreateGroupDialog, showEmptyGroupsState, showEmptyState, showGroupList, showNpcGrid } = useNpcsListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.npcList.actions.addNpc')} creating={creating} secondaryActionLabel={t('pages.npcList.actions.addGroup')} secondaryCreating={creatingGroup} onAction={() => void handleCreateNpc()} onSecondaryAction={handleOpenCreateGroupDialog} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.npcs')} />
      {error ? <p className={styles.status}>{error}</p> : null}
      <div className={styles.tabsContainer}>
        <div className={styles.npcTabs} role="tablist" aria-label={t('pages.main.tabs.npcs')}>
          <button className={`${styles.npcTabButton} ${activeTab === 'groups' ? styles.npcTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
            {t('pages.npcList.tabs.groups')}
          </button>
          <button className={`${styles.npcTabButton} ${activeTab === 'list' ? styles.npcTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
            {t('pages.npcList.tabs.list')}
          </button>
        </div>
        {activeTab === 'groups' ? (
          <>
            {loadingGroups ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.npcList.groups.loading')}</p>
              </section>
            ) : null}
            {showEmptyGroupsState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.npcList.groups.emptyState')}</p>
              </section>
            ) : null}
            {showGroupList ? (
              <section className={styles.groupList} aria-label={t('pages.npcList.tabs.groups')}>
                {groups.map((group) => (
                  <NpcGroupCard key={group.id} group={group} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}
        {activeTab === 'list' ? (
          <>
            {loading ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('common.states.loadingNpcs')}</p>
              </section>
            ) : null}
            {showEmptyState ? (
              <section className={styles.emptyPanel}>
                <p className={styles.emptyText}>{t('pages.npcList.emptyState')}</p>
              </section>
            ) : null}
            {showNpcGrid ? (
              <section className={styles.npcGrid} aria-label={t('pages.main.tabs.npcs')}>
                {cards.map((card) => (
                  <NpcListCard key={card.id} card={card} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}
      </div>
      {showCreateGroupDialog ? <CreateNpcGroupDialog creatingGroup={creatingGroup} groupName={groupName} onCancel={handleCancelCreateGroup} onChangeGroupName={handleChangeGroupName} onSubmit={handleCreateGroupSubmit} /> : null}
      <DeleteCharacterDialog bodyKey="pages.npcList.deleteDialog.body" characterName={deleteDialogNpcName} deleting={deletingId === npcToDelete?.id} open={Boolean(npcToDelete)} titleKey="pages.npcList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteNpc()} />
      <DeleteCharacterDialog bodyKey="pages.npcList.groups.deleteDialog.body" characterName={deleteDialogGroupName} deleting={groupDeletingId === groupToDelete?.id} open={Boolean(groupToDelete)} titleKey="pages.npcList.groups.deleteDialog.title" onCancel={handleCloseDeleteGroupDialog} onConfirm={() => void handleConfirmDeleteNpcGroup()} />
    </>
  )
}
