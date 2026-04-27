import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterPrintPage } from './useCharacterPrintPage'
import styles from './style.module.scss'

export function CharacterPrintPage() {
  const { t } = useI18n()
  const { character, loading, error, levelBonus, speedValue, hpValue, surgeValue, attributeRows, defenseRows, skillRows } =
    useCharacterPrintPage()
  const surgeHealingValue = Math.ceil(Math.max(0, hpValue) / 4)
  const surgeLabel = `${t('pages.characterEdit.fields.surge')} (${surgeHealingValue} HP)`

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.characterPrint.loading')}</p>
      </main>
    )
  }

  if (error || !character) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.characterPrint.error')}</p>
      </main>
    )
  }

  return (
    <main className={styles.pageShell}>
      <button
        className={styles.printButton}
        type="button"
        aria-label={t('pages.characterPrint.printButtonLabel')}
        title={t('pages.characterPrint.printButtonLabel')}
        onClick={() => window.print()}
      >
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.characterPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{t('pages.characterPrint.title')}</p>
            <h1 className={styles.title}>{character.name || t('pages.characterList.unnamedCharacter')}</h1>
          </div>

          <div className={styles.headerMeta}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>{t('pages.characterEdit.fields.level')}</span>
              <span className={styles.metaValue}>{character.level}</span>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>{t('pages.characterPrint.pdLabel')}</span>
              <span className={styles.metaPlaceholder} aria-hidden="true" />
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>{t('pages.characterEdit.fields.race')}</span>
              <span className={styles.metaValue}>{t(`pages.characterEdit.options.race.${character.race}`)}</span>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>{t('pages.characterEdit.fields.class')}</span>
              <span className={styles.metaValue}>{t(`pages.characterEdit.options.class.${character.class}`)}</span>
            </div>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.leftColumn}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Umiejętności (K20+)</h2>
              <div className={styles.skillGrid}>
                {skillRows.map((row) => (
                  <div key={row.key} className={styles.skillCard}>
                    <span className={styles.skillLabel}>{row.label}</span>
                    <span className={styles.skillValue}>{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className={styles.rightColumn}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Atrybuty</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>{t('pages.characterEdit.fields.hp')}</span>
                  <span className={styles.statValue}>{hpValue}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>
                    Przypływ sił <strong>({surgeHealingValue} HP)</strong>
                  </span>
                  <span className={styles.statValue}>{surgeValue}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>{t('pages.characterEdit.fields.speed')}</span>
                  <span className={styles.statValue}>{speedValue}</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Atrybuty</h2>
              <div className={styles.attributeGrid}>
                {attributeRows.map((row) => (
                  <div key={row.key} className={styles.attributeCard}>
                    <span className={styles.statLabel}>{row.label}</span>
                    <span className={styles.attributeValue}>
                      {row.value} ({row.modifier > 0 ? `+${row.modifier}` : row.modifier})
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Obrony</h2>
              <div className={styles.defenseGrid}>
                {defenseRows.map((row) => (
                  <div key={row.key} className={styles.defenseCard}>
                    <span className={styles.statLabel}>{row.label}</span>
                    <span className={styles.defenseValue}>{row.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${styles.section} ${styles.otherPrintSection}`}>
              <h2 className={styles.sectionTitle}>Inne</h2>
              <div className={styles.emptyPrintBlock} aria-hidden="true" />
            </section>
          </section>
        </div>
      </article>

    </main>
  )
}
