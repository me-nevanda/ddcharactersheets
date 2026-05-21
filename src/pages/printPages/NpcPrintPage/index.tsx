import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import type { NpcPrintAttackRow, PrintNpcAttackType } from './types'
import { useNpcPrintPage } from './npcPrintPageHooks'
import styles from './style.module.scss'

const hasRichText = (value: string): boolean => {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

export const NpcPrintPage = () => {
  const { t } = useI18n()
  const { npc, loading, error, title, npcName, statRows, defenseRows, attackRows, weapons, armors, others, hasItems } = useNpcPrintPage()

  const getItemIconName = (category: 'weapon' | 'armor' | 'other') => {
    if (category === 'weapon') {
      return 'sword'
    }

    if (category === 'armor') {
      return 'shield'
    }

    return 'shirt'
  }

  const getAttackTypeClass = (type: PrintNpcAttackType) => {
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

  const getTypeBadgeClass = (type: PrintNpcAttackType) => {
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

  const sortAttacksByType = (attacks: NpcPrintAttackRow[]): NpcPrintAttackRow[] => {
    const typeRank: Record<PrintNpcAttackType, number> = {
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

  const renderAttackCard = (attack: NpcPrintAttackRow) => (
    <article key={attack.key} className={`${styles.attackCard} ${getAttackTypeClass(attack.type)}`}>
      <div className={styles.attackHeader}>
        <div className={styles.attackHeaderRow}>
          <h3 className={styles.attackName}>{attack.name || t('pages.npcPrint.unnamedAttack')}</h3>
          <div className={styles.attackBadges}>
            <span className={`${styles.metaTag} ${attack.action === 'action' ? styles.actionTagAction : styles.actionTagNoAction}`}>
              {t(`pages.characterEdit.abilities.actionOptions.${attack.action}`)}
            </span>
            <span className={`${styles.typeBadge} ${getTypeBadgeClass(attack.type)}`}>
              {t(`pages.npcEdit.attacks.typeOptions.${attack.type}`)}
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
      {attack.attackNotApplicable ? null : (
        <div className={styles.attackSection}>
          <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.attackLabel')}:`}</span>
          <strong className={styles.damageValue}>{attack.attackDisplay}</strong>
        </div>
      )}
      {hasRichText(attack.description) ? <div className={styles.attackDescription} dangerouslySetInnerHTML={{ __html: attack.description }} /> : null}
    </article>
  )

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.npcPrint.loading')}</p>
      </main>
    )
  }

  if (error || !npc) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.npcPrint.error')}</p>
      </main>
    )
  }

  const sortedAttacks = sortAttacksByType(attackRows)
  const hasResistances = hasRichText(npc.resistances)
  const hasSpecial = hasRichText(npc.special)

  return (
    <main className={styles.pageShell}>
      <button className={styles.printButton} type="button" aria-label={t('pages.npcPrint.printButtonLabel')} title={t('pages.npcPrint.printButtonLabel')} onClick={() => window.print()}>
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.npcPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <p className={styles.printHeader}>{`${title} - ${npcName}`}</p>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{title}</p>
            <h1 className={styles.title}>{npcName}</h1>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <section className={`${styles.section} ${styles.descriptionSection}`}>
              <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.description')}</h2>
              <div className={styles.descriptionCopy}>
                {npc.imageUrl ? <img className={styles.npcImage} src={npc.imageUrl} alt={t('pages.npcEdit.fields.image')} /> : null}
                {hasRichText(npc.description) ? <div className={styles.richText} dangerouslySetInnerHTML={{ __html: npc.description }} /> : null}
              </div>
            </section>

            {hasResistances ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.resistances')}</h2>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: npc.resistances }} />
              </section>
            ) : null}

            {hasSpecial ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.special')}</h2>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: npc.special }} />
              </section>
            ) : null}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('pages.npcPrint.sections.stats')}</h2>
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
              <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.defenses')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('pages.npcPrint.sections.attacks')}</h2>
            {sortedAttacks.length > 0 ? <div className={styles.attackGrid}>{sortedAttacks.map(renderAttackCard)}</div> : <p className={styles.emptyState}>{t('pages.npcPrint.emptyAttacks')}</p>}
          </section>
        </div>

        {hasItems ? (
          <section className={`${styles.section} ${styles.itemsSection}`}>
            <h2 className={styles.sectionTitle}>{t('pages.npcPrint.sections.items')}</h2>
            <div className={styles.itemSectionStack}>
              {weapons.length > 0 ? (
                <div className={styles.itemSectionGroup}>
                  <h3 className={styles.itemGroupTitle}>{t('pages.npcPrint.sections.weapons')}</h3>
                  <div className={styles.itemGrid}>
                    {weapons.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h4 className={styles.itemName}>
                          <AppIcon className={styles.itemIcon} name={getItemIconName(item.category)} />
                          <span>{item.name}</span>
                        </h4>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {armors.length > 0 ? (
                <div className={styles.itemSectionGroup}>
                  <h3 className={styles.itemGroupTitle}>{t('pages.npcPrint.sections.armors')}</h3>
                  <div className={styles.itemGrid}>
                    {armors.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h4 className={styles.itemName}>
                          <AppIcon className={styles.itemIcon} name={getItemIconName(item.category)} />
                          <span>{item.name}</span>
                        </h4>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {others.length > 0 ? (
                <div className={styles.itemSectionGroup}>
                  <h3 className={styles.itemGroupTitle}>{t('pages.npcPrint.sections.others')}</h3>
                  <div className={styles.itemGrid}>
                    {others.map((item) => (
                      <article key={item.key} className={styles.itemCard}>
                        <h4 className={styles.itemName}>
                          <AppIcon className={styles.itemIcon} name={getItemIconName(item.category)} />
                          <span>{item.name}</span>
                        </h4>
                        {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  )
}
