import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useMonstersListPage } from './monstersListPageHooks'
import type { MonsterListCardViewModel } from './types'
import styles from './style.module.scss'

const MonsterListCard = ({ card }: { card: MonsterListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.monsterCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardBody}>
        <div className={styles.monsterImageFrame}>
          <img className={styles.monsterImage} src={card.imageSrc} alt="" aria-hidden="true" />
        </div>
        <div className={styles.monsterSummary}>
          <h2 className={styles.monsterName}>{card.label}</h2>
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

export const MonstersListPage = () => {
  const { t } = useI18n()
  const { cards, creating, deletingId, deleteDialogMonsterName, error, handleCloseDeleteDialog, handleConfirmDeleteMonster, handleCreateMonster, loading, monsterToDelete, showEmptyState, showMonsterGrid } = useMonstersListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.characterList.actions.addMonster')} creating={creating} onAction={() => void handleCreateMonster()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.monsters')} />
      {error ? <p className={styles.status}>{error}</p> : null}
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
      <DeleteCharacterDialog bodyKey="pages.monsterList.deleteDialog.body" characterName={deleteDialogMonsterName} deleting={deletingId === monsterToDelete?.id} open={Boolean(monsterToDelete)} titleKey="pages.monsterList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteMonster()} />
    </>
  )
}
