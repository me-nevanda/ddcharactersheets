import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterItemsPrintPage } from './useCharacterItemsPrintPage'
import styles from './style.module.scss'

export function CharacterItemsPrintPage() {
  const { t } = useI18n()
  const { character, loading, error, title, hasItems, armors, weapons, others } = useCharacterItemsPrintPage()

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.characterItemsPrint.loading')}</p>
      </main>
    )
  }

  if (error || !character) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.characterItemsPrint.error')}</p>
      </main>
    )
  }

  return (
    <main className={styles.pageShell}>
      <button
        className={styles.printButton}
        type="button"
        aria-label={t('pages.characterItemsPrint.printButtonLabel')}
        title={t('pages.characterItemsPrint.printButtonLabel')}
        onClick={() => window.print()}
      >
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.characterItemsPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{t('pages.characterItemsPrint.title')}</p>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </header>

        <section className={styles.section}>
          {hasItems ? (
            <div className={styles.sectionStack}>
              {weapons.length > 0 ? (
                <section className={styles.sectionGroup}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterItemsPrint.sections.weapons')}</h2>
                  <div className={styles.itemGrid}>
                    {weapons.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {armors.length > 0 ? (
                <section className={styles.sectionGroup}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterItemsPrint.sections.armors')}</h2>
                  <div className={styles.itemGrid}>
                    {armors.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {others.length > 0 ? (
                <section className={styles.sectionGroup}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterItemsPrint.sections.others')}</h2>
                  <div className={styles.itemGrid}>
                    {others.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <p className={styles.emptyState}>{t('pages.characterItemsPrint.emptyState')}</p>
          )}
        </section>
      </article>

    </main>
  )
}
