import { useI18n } from '@i18n/index';
import styles from '../../style.module.scss';
import { useCharacterEditPageContext } from '../../characterEditPageContext';
import { alignmentOptions, classOptions, genderOptions, raceOptions } from '@dictionaries/characterEditDefinitions';
export const GeneralSection = () => {
    const { t } = useI18n();
    const { form, levelBonusLabel, handleGeneralChange, hpValue, hpTooltip, surgeValue, speedValue, speedTooltip } = useCharacterEditPageContext();
    const surgeHealingValue = Math.ceil(Math.max(0, hpValue) / 4);
    return (<section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.general')}</h2>
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="level">
            {t('pages.characterEdit.fields.level')}
          </label>
          <input className={styles.input} id="level" name="level" type="number" min={1} max={30} inputMode="numeric" value={form.level} onChange={handleGeneralChange}/>
          <span className={styles.modifierBadge}>{levelBonusLabel}</span>
        </div>

        <div className={styles.generalValueCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.speed')}</span>
          <span className={styles.modifierBadge} title={speedTooltip} aria-label={speedTooltip}>
            {speedValue}
          </span>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="race">
            {t('pages.characterEdit.fields.race')}
          </label>
          <select className={`${styles.input} ${styles.selectChevronInset}`} id="race" name="race" value={form.race} onChange={handleGeneralChange}>
            {raceOptions.map((optionKey) => {
            const label = t(`pages.characterEdit.options.race.${optionKey}`);
            return (<option key={optionKey} value={optionKey}>
                  {label}
                </option>);
        })}
          </select>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="class">
            {t('pages.characterEdit.fields.class')}
          </label>
          <select className={`${styles.input} ${styles.selectChevronInset}`} id="class" name="class" value={form.class} onChange={handleGeneralChange}>
            {classOptions.map((optionKey) => {
            const label = t(`pages.characterEdit.options.class.${optionKey}`);
            return (<option key={optionKey} value={optionKey}>
                  {label}
                </option>);
        })}
          </select>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="gender">
            {t('pages.characterEdit.fields.gender')}
          </label>
          <select className={`${styles.input} ${styles.selectChevronInset}`} id="gender" name="gender" value={form.gender} onChange={handleGeneralChange}>
            {genderOptions.map((optionKey) => {
            const label = t(`pages.characterEdit.options.gender.${optionKey}`);
            return (<option key={optionKey} value={optionKey}>
                  {label}
                </option>);
        })}
          </select>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="alignment">
            {t('pages.characterEdit.fields.alignment')}
          </label>
          <select className={`${styles.input} ${styles.selectChevronInset}`} id="alignment" name="alignment" value={form.alignment} onChange={handleGeneralChange}>
            {alignmentOptions.map((optionKey) => {
            const label = t(`pages.characterEdit.options.alignment.${optionKey}`);
            return (<option key={optionKey} value={optionKey}>
                  {label}
                </option>);
        })}
          </select>
        </div>

        <div className={styles.generalValueCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.hp')}</span>
          <span className={styles.modifierBadge} title={hpTooltip} aria-label={hpTooltip}>
            {hpValue}
          </span>
        </div>

        <div className={styles.generalValueCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.surge')}</span>
          <div className={styles.surgeValueRow}>
            <span className={styles.surgeValueBox}>{surgeValue}</span>
            <span className={styles.surgeValueSeparator}>x</span>
            <span className={styles.surgeValueBox}>{surgeHealingValue} HP</span>
          </div>
        </div>
      </div>
    </section>);
};
