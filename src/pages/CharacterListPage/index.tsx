import { Link } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { getIntlLocale, useI18n } from '@i18n/index'
import { CharacterClass, CharacterRace } from '../../types/character'
import type { Character } from '../../types/character'
import styles from './style.module.scss'
import type { CharacterListPageState } from './types'
import { useCharacterListPage } from './useCharacterListPage'

function formatUpdatedAt(value: string, locale: string, t: (key: string) => string): string {
  if (!value) {
    return t('pages.characterList.missingUpdatedAt')
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getCharacterLabel(character: Character | null, t: (key: string) => string): string {
  return character?.name || t('pages.characterList.unnamedCharacter')
}

function getRaceLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterRace).includes(character.race)) {
    return t('pages.characterList.missingRace')
  }

  return t(`pages.characterEdit.options.race.${character.race}`)
}

function getClassLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterClass).includes(character.class)) {
    return t('pages.characterList.missingClass')
  }

  return t(`pages.characterEdit.options.class.${character.class}`)
}

function CharacterListPageContent({
  characters,
  creating,
  deletingId,
  error,
  loading,
  characterToDelete,
  handleCloseDeleteDialog,
  handleConfirmDeleteCharacter,
  handleCreateCharacter,
  handleOpenDeleteDialog,
}: CharacterListPageState) {
  const { locale, t } = useI18n()

  return (
    <>
      <main className={styles.pageShell}>
        <header className={styles.hero}>
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

        {!loading && characters.length === 0 ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.characterList.emptyState')}</p>
          </section>
        ) : null}

        {!loading && characters.length > 0 ? (
          <section className={styles.characterGrid}>
            {characters.map((character) => (
              <article className={styles.characterCard} key={character.id}>
                <div className={styles.characterSummary}>
                  <h2 className={styles.characterName}>{getCharacterLabel(character, t)}</h2>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardMetaItem}>
                      {getRaceLabel(character, t)}
                    </span>
                    <span className={styles.cardMetaItem}>
                      {getClassLabel(character, t)}
                    </span>
                    <span className={styles.cardMetaItem}>
                      {formatUpdatedAt(character.updatedAt, locale, t)}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    aria-label={t('common.actions.delete')}
                    className={`${styles.dangerButton} ${styles.iconOnlyButton}`}
                    type="button"
                    title={t('common.actions.delete')}
                    onClick={() => handleOpenDeleteDialog(character)}
                    disabled={deletingId === character.id}
                  >
                    <AppIcon name="trash" />
                  </button>
                  <Link className={styles.secondaryButton} to={`/characters/${character.id}/edit`}>
                    <span className={styles.buttonContent}>
                      <AppIcon name="edit" />
                      <span>{t('common.actions.edit')}</span>
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>

      <DeleteCharacterDialog
        characterName={getCharacterLabel(characterToDelete, t)}
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
