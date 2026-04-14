import { Link } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterAbilitiesPrintPage } from './useCharacterAbilitiesPrintPage'
import styles from './style.module.scss'

export function CharacterAbilitiesPrintPage() {
  const { t } = useI18n()
  const { character, loading, error, abilityRows, hasAbilities, title } = useCharacterAbilitiesPrintPage()
  const offensiveAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.kind === 'offensive'))
  const utilityAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.kind === 'utility'))

  function getAbilityTypeClass(type: 'unlimited' | 'encounter' | 'daily') {
    if (type === 'encounter') {
      return styles.abilityCardEncounter
    }

    if (type === 'daily') {
      return styles.abilityCardDaily
    }

    return styles.abilityCardUnlimited
  }

  function getTypeBadgeClass(type: 'unlimited' | 'encounter' | 'daily') {
    if (type === 'encounter') {
      return styles.typeBadgeEncounter
    }

    if (type === 'daily') {
      return styles.typeBadgeDaily
    }

    return styles.typeBadgeUnlimited
  }

  function sortAbilitiesByType(abilities: typeof abilityRows): typeof abilityRows {
    const typeRank: Record<'unlimited' | 'encounter' | 'daily', number> = {
      unlimited: 0,
      encounter: 1,
      daily: 2,
    }

    return abilities
      .map((ability, index) => ({ ability, index }))
      .sort((left, right) => {
        const typeDiff = typeRank[left.ability.type] - typeRank[right.ability.type]

        if (typeDiff !== 0) {
          return typeDiff
        }

        return left.index - right.index
      })
      .map(({ ability }) => ability)
  }

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.characterAbilitiesPrint.loading')}</p>
      </main>
    )
  }

  if (error || !character) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.characterAbilitiesPrint.error')}</p>
      </main>
    )
  }

  return (
    <main className={styles.pageShell}>
      <button
        className={styles.printButton}
        type="button"
        aria-label={t('pages.characterAbilitiesPrint.printButtonLabel')}
        title={t('pages.characterAbilitiesPrint.printButtonLabel')}
        onClick={() => window.print()}
      >
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.characterAbilitiesPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{t('pages.characterEdit.tabs.abilities')}</p>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </header>

        <section className={styles.section}>
          {hasAbilities ? (
            <div className={styles.sectionStack}>
              {hasAbilities ? (
                <>
                  <section className={styles.sectionGroup}>
                    <h2 className={styles.sectionTitle}>{t('pages.characterAbilitiesPrint.sections.offensive')}</h2>
                    {offensiveAbilities.length > 0 ? (
                      <div className={styles.abilityGrid}>
                        {offensiveAbilities.map((ability) => (
                          <article key={ability.key} className={`${styles.abilityCard} ${getAbilityTypeClass(ability.type)}`}>
                            <div className={styles.abilityHeader}>
                              <div className={styles.abilityHeaderRow}>
                                <h3 className={styles.abilityName}>{ability.name}</h3>
                                <div className={styles.abilityBadges}>
                                  <span
                                    className={`${styles.metaTag} ${ability.action === 'action' ? styles.actionTagAction : styles.actionTagNoAction}`}
                                  >
                                    {ability.meta[0]}
                                  </span>
                                  <span className={`${styles.typeBadge} ${getTypeBadgeClass(ability.type)}`}>
                                    {t(`pages.characterEdit.abilities.typeOptions.${ability.type}`)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={styles.detailListInline}>
                              {ability.details.map((detail) => (
                                <div key={detail.label} className={styles.detailRow}>
                                  <span className={styles.detailLabel}>{detail.label}:</span>
                                  <strong className={styles.detailValue}>{detail.value}</strong>
                                </div>
                              ))}
                            </div>
                            {ability.kind === 'offensive' && ability.weaponAttackDisplay.length > 0 ? (
                              <div className={styles.attackSection}>
                                <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.attackLabel')}:`}</span>
                                <strong className={styles.damageValue}>{ability.weaponAttackDisplay}</strong>
                              </div>
                            ) : null}
                            {ability.damage.length > 0 ? (
                              <div className={styles.damageSection}>
                                <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.damageLabel')}:`}</span>
                                <strong className={styles.damageValue}>{ability.damage}</strong>
                              </div>
                            ) : null}
                            {ability.kind === 'offensive' ? (
                              ability.offensiveNotes.length > 0 ? (
                                <div className={styles.offensiveNotes}>
                                  {ability.offensiveNotes.map((note) => (
                                    <div key={note.label} className={styles.detailRow}>
                                      <span className={styles.detailLabel}>{note.label}:</span>
                                      <strong className={styles.detailValue}>{note.value}</strong>
                                    </div>
                                  ))}
                                </div>
                              ) : null
                            ) : ability.description ? (
                              <p className={styles.abilityDescription}>{ability.description}</p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyState}>{t('pages.characterAbilitiesPrint.emptyState')}</p>
                    )}
                  </section>

                  <section className={styles.sectionGroup}>
                    <h2 className={styles.sectionTitle}>{t('pages.characterAbilitiesPrint.sections.utility')}</h2>
                    {utilityAbilities.length > 0 ? (
                      <div className={styles.abilityGrid}>
                        {utilityAbilities.map((ability) => (
                          <article key={ability.key} className={`${styles.abilityCard} ${getAbilityTypeClass(ability.type)}`}>
                            <div className={styles.abilityHeader}>
                              <div className={styles.abilityHeaderRow}>
                                <h3 className={styles.abilityName}>{ability.name}</h3>
                                <div className={styles.abilityBadges}>
                                  <span className={`${styles.metaTag} ${ability.action === 'action' ? styles.actionTagAction : styles.actionTagNoAction}`}>
                                    {ability.meta[0]}
                                  </span>
                                  <span className={`${styles.typeBadge} ${getTypeBadgeClass(ability.type)}`}>
                                    {t(`pages.characterEdit.abilities.typeOptions.${ability.type}`)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={styles.detailListInline}>
                              {ability.details.map((detail) => (
                                <div key={detail.label} className={styles.detailRow}>
                                  <span className={styles.detailLabel}>{detail.label}:</span>
                                  <strong className={styles.detailValue}>{detail.value}</strong>
                                </div>
                              ))}
                            </div>
                            {ability.description ? <p className={styles.abilityDescription}>{ability.description}</p> : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyState}>{t('pages.characterAbilitiesPrint.emptyState')}</p>
                    )}
                  </section>
                </>
              ) : null}

            </div>
          ) : (
            <p className={styles.emptyState}>{t('pages.characterAbilitiesPrint.emptyState')}</p>
          )}
        </section>
      </article>

      <Link className={styles.backLink} to={`/characters/${character.id}/edit`}>
        {t('pages.characterAbilitiesPrint.back')}
      </Link>
    </main>
  )
}
