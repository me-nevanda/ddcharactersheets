import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import type { MonsterPrintAttackRow, PrintMonsterAttackType } from './types'
import { useMonsterPrintPage } from './monsterPrintPageHooks'
import styles from './style.module.scss'

const hasRichText = (value: string): boolean => {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

export const MonsterPrintPage = () => {
  const { t } = useI18n()
  const { monster, loading, error, title, monsterName, statRows, defenseRows, attackRows } = useMonsterPrintPage()

  const getAttackTypeClass = (type: PrintMonsterAttackType) => {
    if (type === 'standard') {
      return styles.attackCardStandard
    }

    if (type === 'encounter') {
      return styles.attackCardEncounter
    }

    if (type === 'daily') {
      return styles.attackCardDaily
    }

    return styles.attackCardUnlimited
  }

  const getTypeBadgeClass = (type: PrintMonsterAttackType) => {
    if (type === 'standard') {
      return styles.typeBadgeStandard
    }

    if (type === 'encounter') {
      return styles.typeBadgeEncounter
    }

    if (type === 'daily') {
      return styles.typeBadgeDaily
    }

    return styles.typeBadgeUnlimited
  }

  const sortAttacksByType = (attacks: MonsterPrintAttackRow[]): MonsterPrintAttackRow[] => {
    const typeRank: Record<PrintMonsterAttackType, number> = {
      standard: 0,
      unlimited: 1,
      encounter: 2,
      daily: 3,
    }

    return attacks
      .map((attack, index) => ({ attack, index }))
      .sort((left, right) => {
        const typeDiff = typeRank[left.attack.type] - typeRank[right.attack.type]

        if (typeDiff !== 0) {
          return typeDiff
        }

        return left.index - right.index
      })
      .map(({ attack }) => attack)
  }

  const renderAttackCard = (attack: MonsterPrintAttackRow) => (
    <article key={attack.key} className={`${styles.attackCard} ${getAttackTypeClass(attack.type)}`}>
      <div className={styles.attackHeader}>
        <div className={styles.attackHeaderRow}>
          <h3 className={styles.attackName}>{attack.name || t('pages.monsterPrint.unnamedAttack')}</h3>
          <div className={styles.attackBadges}>
            <span className={`${styles.metaTag} ${attack.action === 'action' ? styles.actionTagAction : styles.actionTagNoAction}`}>
              {t(`pages.characterEdit.abilities.actionOptions.${attack.action}`)}
            </span>
            <span className={`${styles.typeBadge} ${getTypeBadgeClass(attack.type)}`}>
              {t(`pages.monsterEdit.attacks.typeOptions.${attack.type}`)}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.detailListInline}>
        {attack.range > 0 ? (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('pages.characterEdit.abilities.weaponRangeLabel')}:</span>
            <strong className={styles.detailValue}>{attack.range}</strong>
          </div>
        ) : null}
        {attack.areaLabel ? (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('pages.characterEdit.abilities.areaLabel')}:</span>
            <strong className={styles.detailValue}>{attack.areaLabel}</strong>
          </div>
        ) : null}
      </div>
      <div className={styles.attackSection}>
        <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.attackLabel')}:`}</span>
        <strong className={styles.damageValue}>{attack.attackDisplay}</strong>
      </div>
      {hasRichText(attack.description) ? <div className={styles.attackDescription} dangerouslySetInnerHTML={{ __html: attack.description }} /> : null}
    </article>
  )

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.monsterPrint.loading')}</p>
      </main>
    )
  }

  if (error || !monster) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.monsterPrint.error')}</p>
      </main>
    )
  }

  const sortedAttacks = sortAttacksByType(attackRows)
  const hasResistances = hasRichText(monster.resistances)
  const hasSpecial = hasRichText(monster.special)

  return (
    <main className={styles.pageShell}>
      <button className={styles.printButton} type="button" aria-label={t('pages.monsterPrint.printButtonLabel')} title={t('pages.monsterPrint.printButtonLabel')} onClick={() => window.print()}>
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.monsterPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <p className={styles.printHeader}>{`${title} - ${monsterName}`}</p>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{title}</p>
            <h1 className={styles.title}>{monsterName}</h1>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <section className={`${styles.section} ${styles.descriptionSection}`}>
              <div className={styles.descriptionCopy}>
                <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.description')}</h2>
                {hasRichText(monster.description) ? <div className={styles.richText} dangerouslySetInnerHTML={{ __html: monster.description }} /> : null}
              </div>
              {monster.imageUrl ? <img className={styles.monsterImage} src={monster.imageUrl} alt={t('pages.monsterEdit.fields.image')} /> : null}
            </section>

            {hasResistances ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.resistances')}</h2>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: monster.resistances }} />
              </section>
            ) : null}

            {hasSpecial ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.special')}</h2>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: monster.special }} />
              </section>
            ) : null}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('pages.monsterPrint.sections.stats')}</h2>
              <div className={styles.compactGrid}>
                {statRows.map((row) => (
                  <div key={row.label} className={styles.valueCard}>
                    <span className={styles.valueLabel}>{row.label}</span>
                    <strong className={styles.valueNumber}>{row.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.defenses')}</h2>
              <div className={styles.compactGrid}>
                {defenseRows.map((row) => (
                  <div key={row.label} className={styles.valueCard}>
                    <span className={styles.valueLabel}>{row.label}</span>
                    <strong className={styles.valueNumber}>{row.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className={`${styles.section} ${styles.attacksSection}`}>
            <h2 className={styles.sectionTitle}>{t('pages.monsterPrint.sections.attacks')}</h2>
            {sortedAttacks.length > 0 ? <div className={styles.attackGrid}>{sortedAttacks.map(renderAttackCard)}</div> : <p className={styles.emptyState}>{t('pages.monsterPrint.emptyAttacks')}</p>}
          </section>
        </div>
      </article>
    </main>
  )
}
