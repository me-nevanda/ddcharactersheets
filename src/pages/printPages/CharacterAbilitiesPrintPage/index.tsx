import { AppIcon } from '@components/AppIcon';
import { useI18n } from '@i18n/index';
import type { PrintAbilityRow, PrintAbilityType } from './types';
import { useCharacterAbilitiesPrintPage } from './useCharacterAbilitiesPrintPage';
import styles from './style.module.scss';
export const CharacterAbilitiesPrintPage = () => {
    const { t } = useI18n();
    const { character, loading, error, abilityRows, featRows, hasAbilities, hasFeats, title, characterName } = useCharacterAbilitiesPrintPage();
    const getAbilityTypeClass = (type: PrintAbilityType) => {
        if (type === 'standard') {
            return styles.abilityCardStandard;
        }
        if (type === 'encounter') {
            return styles.abilityCardEncounter;
        }
        if (type === 'daily') {
            return styles.abilityCardDaily;
        }
        return styles.abilityCardUnlimited;
    };
    const getTypeBadgeClass = (type: PrintAbilityType) => {
        if (type === 'standard') {
            return styles.typeBadgeStandard;
        }
        if (type === 'encounter') {
            return styles.typeBadgeEncounter;
        }
        if (type === 'daily') {
            return styles.typeBadgeDaily;
        }
        return styles.typeBadgeUnlimited;
    };
    const sortAbilitiesByType = (abilities: PrintAbilityRow[]): PrintAbilityRow[] => {
        const typeRank: Record<PrintAbilityType, number> = {
            standard: 0,
            unlimited: 1,
            encounter: 2,
            daily: 3,
        };
        return abilities
            .map((ability, index) => ({ ability, index }))
            .sort((left, right) => {
            const typeDiff = typeRank[left.ability.type] - typeRank[right.ability.type];
            if (typeDiff !== 0) {
                return typeDiff;
            }
            return left.index - right.index;
        })
            .map(({ ability }) => ability);
    };
    const standardAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.type === 'standard'));
    const unlimitedAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.type === 'unlimited'));
    const encounterAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.type === 'encounter'));
    const dailyAbilities = sortAbilitiesByType(abilityRows.filter((ability) => ability.type === 'daily'));
    const renderAbilitySection = (titleKey: string, abilities: PrintAbilityRow[]) => {
        if (abilities.length === 0) {
            return null;
        }
        return (<section className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>{t(titleKey)}</h2>
        <div className={styles.abilityGrid}>
          {abilities.map((ability) => (<article key={ability.key} className={`${styles.abilityCard} ${getAbilityTypeClass(ability.type)}`}>
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
                {ability.details.map((detail) => (<div key={detail.label} className={styles.detailRow}>
                    <span className={styles.detailLabel}>{detail.label}:</span>
                    <strong className={styles.detailValue}>{detail.value}</strong>
                  </div>))}
              </div>
              {ability.kind === 'offensive' && ability.weaponAttackDisplay.length > 0 ? (<div className={styles.attackSection}>
                  <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.attackLabel')}:`}</span>
                  <strong className={styles.damageValue}>{ability.weaponAttackDisplay}</strong>
                </div>) : null}
              {ability.damage.length > 0 ? (<div className={styles.damageSection}>
                  <span className={styles.damageLabel}>{`${t('pages.characterAbilitiesPrint.damageLabel')}:`}</span>
                  <strong className={styles.damageValue}>{ability.damage}</strong>
                </div>) : null}
              {ability.offensiveNotes.length > 0 ? (<div className={styles.offensiveNotes}>
                  {ability.offensiveNotes.map((note) => (<div key={note.label} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{note.label}:</span>
                      <strong className={styles.detailValue}>{note.value}</strong>
                    </div>))}
                </div>) : ability.description ? (<p className={styles.abilityDescription}>{ability.description}</p>) : null}
            </article>))}
        </div>
      </section>);
    };
    if (loading) {
        return (<main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.characterAbilitiesPrint.loading')}</p>
      </main>);
    }
    if (error || !character) {
        return (<main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.characterAbilitiesPrint.error')}</p>
      </main>);
    }
    return (<main className={styles.pageShell}>
      <button className={styles.printButton} type="button" aria-label={t('pages.characterAbilitiesPrint.printButtonLabel')} title={t('pages.characterAbilitiesPrint.printButtonLabel')} onClick={() => window.print()}>
        <span className={styles.printButtonContent}>
          <AppIcon name="print"/>
          <span>{t('pages.characterAbilitiesPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <p className={styles.printHeader}>{`${title} - ${characterName}`}</p>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{title}</p>
            <h1 className={styles.title}>{characterName}</h1>
          </div>
        </header>

        <section className={styles.section}>
          {hasAbilities || hasFeats ? (<div className={styles.sectionStack}>
              {hasAbilities ? (<>
                  {renderAbilitySection('pages.characterAbilitiesPrint.sections.standard', standardAbilities)}
                  {renderAbilitySection('pages.characterAbilitiesPrint.sections.unlimited', unlimitedAbilities)}
                  {renderAbilitySection('pages.characterAbilitiesPrint.sections.encounter', encounterAbilities)}
                  {renderAbilitySection('pages.characterAbilitiesPrint.sections.daily', dailyAbilities)}
                </>) : null}

              {hasFeats ? (<section className={styles.sectionGroup}>
                  <h2 className={styles.sectionTitle}>{t('pages.characterAbilitiesPrint.sections.feats')}</h2>
                  <div className={styles.featGrid}>
                    {featRows.map((feat) => (<article key={feat.key} className={styles.featCard}>
                        <h3 className={styles.featName}>{feat.name}</h3>
                        {feat.description ? <p className={styles.featDescription}>{feat.description}</p> : null}
                      </article>))}
                  </div>
                </section>) : null}
            </div>) : (<p className={styles.emptyState}>{t('pages.characterAbilitiesPrint.emptyState')}</p>)}
        </section>
      </article>
    </main>);
};
