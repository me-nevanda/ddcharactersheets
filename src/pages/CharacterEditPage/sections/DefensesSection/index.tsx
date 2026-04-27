import { useI18n } from '@i18n/index';
import styles from '../../style.module.scss';
import { useCharacterEditPageContext } from '../../characterEditPageContext';
export const DefensesSection = () => {
    const { t } = useI18n();
    const { defenseValues, defenseTooltips } = useCharacterEditPageContext();
    return (<section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.defenses')}</h2>
      </div>

      <div className={styles.numericGrid}>
        <div className={styles.defenseCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.kp')}</span>
          <span className={styles.modifierBadge} title={defenseTooltips.kp} aria-label={defenseTooltips.kp}>
            {defenseValues.kp}
          </span>
        </div>

        <div className={styles.defenseCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.fortitude')}</span>
          <span className={styles.modifierBadge} title={defenseTooltips.fortitude} aria-label={defenseTooltips.fortitude}>
            {defenseValues.fortitude}
          </span>
        </div>

        <div className={styles.defenseCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.reflex')}</span>
          <span className={styles.modifierBadge} title={defenseTooltips.reflex} aria-label={defenseTooltips.reflex}>
            {defenseValues.reflex}
          </span>
        </div>

        <div className={styles.defenseCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.will')}</span>
          <span className={styles.modifierBadge} title={defenseTooltips.will} aria-label={defenseTooltips.will}>
            {defenseValues.will}
          </span>
        </div>
      </div>
    </section>);
};
