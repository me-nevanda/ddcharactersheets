import { useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterAlignment, CharacterClass, CharacterGender, CharacterRace } from '../../types/character'
import type { Character } from '../../types/character'
import styles from './style.module.scss'
import type { CharacterListPageState } from './types'
import { useCharacterListPage } from './useCharacterListPage'

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

function getGenderLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterGender).includes(character.gender)) {
    return t('pages.characterEdit.options.gender.unspecified')
  }

  return t(`pages.characterEdit.options.gender.${character.gender}`)
}

function getAlignmentLabel(character: Character, t: (key: string) => string): string {
  if (!Object.values(CharacterAlignment).includes(character.alignment)) {
    return t('pages.characterEdit.options.alignment.trueNeutral')
  }

  return t(`pages.characterEdit.options.alignment.${character.alignment}`)
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
  const navigate = useNavigate()
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

        {!loading && characters.length === 0 ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.characterList.emptyState')}</p>
          </section>
        ) : null}

        {!loading && characters.length > 0 ? (
          <section className={styles.characterGrid}>
            {characters.map((character) => (
              <article
                className={styles.characterCard}
                key={character.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/characters/${character.id}/edit`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/characters/${character.id}/edit`)
                  }
                }}
              >
                <div className={styles.cardBody}>
                  <img
                    className={styles.cardPortrait}
                    src="/c1.png"
                    alt=""
                    aria-hidden="true"
                  />

                  <div className={styles.characterSummary}>
                    <h2 className={styles.characterName}>{getCharacterLabel(character, t)}</h2>
                    <div className={styles.cardMetaGroup}>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>{getRaceLabel(character, t)}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>{getClassLabel(character, t)}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>{getGenderLabel(character, t)}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>{getAlignmentLabel(character, t)}</span>
                        <span className={styles.cardMetaSeparator} aria-hidden="true">|</span>
                        <span className={styles.cardMetaItem}>
                          {t('pages.characterEdit.fields.level')} {character.level}
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
                    onClick={(event) => {
                      event.stopPropagation()
                      handleOpenDeleteDialog(character)
                    }}
                    disabled={deletingId === character.id}
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
