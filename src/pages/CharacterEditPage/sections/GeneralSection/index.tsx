import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import { classOptions, raceOptions } from '@dictionaries/characterEditDefinitions'

export function GeneralSection() {
  const { t } = useI18n()
  const { form, levelBonusLabel, handleGeneralChange, hpValue, surgeValue } = useCharacterEditPageContext()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.general')}</h2>
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="level">
            {t('pages.characterEdit.fields.level')}
          </label>
          <input
            className={styles.input}
            id="level"
            name="level"
            type="number"
            min={1}
            max={30}
            inputMode="numeric"
            value={form.level}
            onChange={handleGeneralChange}
          />
          <span className={styles.modifierBadge}>{levelBonusLabel}</span>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="speed">
            {t('pages.characterEdit.fields.speed')}
          </label>
          <input
            className={styles.input}
            id="speed"
            name="speed"
            type="number"
            min={1}
            max={12}
            inputMode="numeric"
            value={form.speed}
            onChange={handleGeneralChange}
          />
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="race">
            {t('pages.characterEdit.fields.race')}
          </label>
          <select
            className={`${styles.input} ${styles.selectChevronInset}`}
            id="race"
            name="race"
            value={form.race}
            onChange={handleGeneralChange}
          >
            {raceOptions.map((optionKey) => {
              const label = t(`pages.characterEdit.options.race.${optionKey}`)

              return (
                <option key={optionKey} value={optionKey}>
                  {label}
                </option>
              )
            })}
          </select>
        </div>

        <div className={styles.generalCard}>
          <label className={styles.attributeLabel} htmlFor="class">
            {t('pages.characterEdit.fields.class')}
          </label>
          <select
            className={`${styles.input} ${styles.selectChevronInset}`}
            id="class"
            name="class"
            value={form.class}
            onChange={handleGeneralChange}
          >
            {classOptions.map((optionKey) => {
              const label = t(`pages.characterEdit.options.class.${optionKey}`)

              return (
                <option key={optionKey} value={optionKey}>
                  {label}
                </option>
              )
            })}
          </select>
        </div>

        <div className={styles.generalValueCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.hp')}</span>
          <span className={styles.modifierBadge}>{hpValue}</span>
        </div>

        <div className={styles.generalValueCard}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.surge')}</span>
          <span className={styles.modifierBadge}>{surgeValue}</span>
        </div>
      </div>
    </section>
  )
}
