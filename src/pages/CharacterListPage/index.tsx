import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListCard } from './CharacterListCard'
import { CharacterListHeader } from './CharacterListHeader'
import styles from './style.module.scss'
import type { CharacterListPageState } from './types'
import { useCharacterListPage } from './useCharacterListPage'

function CharacterListPageContent({
  cards,
  creating,
  deletingId,
  deleteDialogCharacterName,
  error,
  handleCardImageError,
  loading,
  characterToDelete,
  handleCloseDeleteDialog,
  handleConfirmDeleteCharacter,
  handleCreateCharacter,
  showCharacterGrid,
  showEmptyState,
}: CharacterListPageState) {
  const { t } = useI18n()

  return (
    <>
      <main className={styles.pageShell}>
        <CharacterListHeader
          creating={creating}
          onCreateCharacter={() => void handleCreateCharacter()}
        />

        {error ? <p className={styles.status}>{error}</p> : null}

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
          <section className={styles.characterGrid}>
            {cards.map((card) => (
              <CharacterListCard
                key={card.id}
                card={card}
                onImageError={handleCardImageError}
              />
            ))}
          </section>
        ) : null}
      </main>

      <DeleteCharacterDialog
        characterName={deleteDialogCharacterName}
        deleting={deletingId === characterToDelete?.id}
        open={Boolean(characterToDelete)}
        onCancel={handleCloseDeleteDialog}
        onConfirm={() => void handleConfirmDeleteCharacter()}
      />
    </>
  )
}

export function CharacterListPage() {
  const page = useCharacterListPage()

  return <CharacterListPageContent {...page} />
}
