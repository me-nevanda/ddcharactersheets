import { useI18n } from '../../../../i18n'
import styles from '../../style.module.scss'
import type { GeneralSectionProps } from '../../types'
import { classOptions, raceOptions } from '@dictionaries/characterEditDefinitions'

export function GeneralSection({ form, levelBonusLabel, onChange }: GeneralSectionProps) {
  const { t } = useI18n()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.sections.general')}</h2>
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            {t('pages.characterEdit.fields.name')}
          </label>
          <input
            className={styles.input}
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            placeholder={t('pages.characterEdit.placeholders.name')}
            autoComplete="off"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="level">
            {t('pages.characterEdit.fields.level')}
          </label>
          <div className={styles.valueRow}>
            <input
              className={styles.input}
              id="level"
              name="level"
              type="number"
              min={1}
              max={30}
              inputMode="numeric"
              value={form.level}
              onChange={onChange}
            />
            <span className={styles.modifierBadge}>{levelBonusLabel}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="speed">
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
            onChange={onChange}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="race">
            {t('pages.characterEdit.fields.race')}
          </label>
          <select
            className={styles.input}
            id="race"
            name="race"
            value={form.race}
            onChange={onChange}
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="class">
            {t('pages.characterEdit.fields.class')}
          </label>
          <select
            className={styles.input}
            id="class"
            name="class"
            value={form.class}
            onChange={onChange}
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
      </div>
    </section>
  )
}
