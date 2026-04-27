import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import type { CharacterListCardProps } from './types'
import styles from './style.module.scss'

export function CharacterListCard({
  card,
  onImageError,
}: CharacterListCardProps) {
  const { t } = useI18n()

  return (
    <article
      className={styles.characterCard}
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
            onError={onImageError}
          />
          <img
            className={styles.cardClass}
            src={card.classSrc}
            alt=""
            aria-hidden="true"
            onError={onImageError}
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
          className={styles.dangerButton}
          type="button"
          title={t('common.actions.delete')}
          onClick={card.onDeleteClick}
          disabled={card.deleting}
        >
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}
