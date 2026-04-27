import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
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
        <header className={styles.hero}>
          <div><img className={styles.headerLogo} src="/favicon.png" alt="" aria-hidden="true" /></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t('pages.characterList.eyebrow')}</p>
            <h1 className={styles.title}>{t('pages.characterList.title')}</h1>
          </div>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => void handleCreateCharacter()}
            disabled={creating}
          >
            <span className={styles.buttonContent}>
              <AppIcon name="plus" />
              <span>{creating ? t('common.states.creating') : t('common.actions.addCard')}</span>
            </span>
          </button>
        </header>

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
              <article
                className={styles.characterCard}
                key={card.id}
                role="link"
                tabIndex={0}
                onClick={card.onOpen}
                onKeyDown={card.onKeyDown}
              >
                <div className={styles.cardBody}>
                  <div className={styles.cardPortraitStack}>
                    <img
                      className={styles.cardPortrait}
                      src={card.portraitSrc}
                      alt=""
                      aria-hidden="true"
                      onError={handleCardImageError}
                    />
                    <img
                      className={styles.cardClass}
                      src={card.classSrc}
                      alt=""
                      aria-hidden="true"
                      onError={handleCardImageError}
                    />
                  </div>

                  <div className={styles.characterSummary}>
                    <h2 className={styles.characterName}>{card.label}</h2>
                    <div className={styles.cardMetaGroup}>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>{card.raceLabel}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>{card.classLabel}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>{card.genderLabel}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>{card.alignmentLabel}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>
                          {t('pages.characterEdit.fields.level')} {card.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    aria-label={t('common.actions.delete')}
                    className={`${styles.dangerButton} ${styles.iconOnlyButton}`}
                    type="button"
                    title={t('common.actions.delete')}
                    onClick={card.onDeleteClick}
                    disabled={card.deleting || deletingId === card.id}
                  >
                    <AppIcon name="trash" />
                  </button>
                </div>
              </article>
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
