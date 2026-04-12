import { Link } from 'react-router-dom'
import { AppIcon } from '../../components/AppIcon'
import { useI18n } from '../../i18n'
import { AttributesSection } from './sections/AttributesSection'
import { DefensesSection } from './sections/DefensesSection'
import { GeneralSection } from './sections/GeneralSection'
import { SkillSection } from './sections/SkillSection'
import styles from './style.module.scss'
import type { CharacterEditPageState } from './types'
import { useCharacterEditPage } from './useCharacterEditPage'

function CharacterEditPageContent({
  error,
  form,
  loading,
  saving,
  handleGeneralChange,
  handleAttributeChange,
  handleTrainingChange,
  handleSubmit,
  attributeRows,
  levelBonusLabel,
  skillModifiers,
  defenseValues,
}: CharacterEditPageState) {
  const { t } = useI18n()

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{t('pages.characterEdit.eyebrow')}</p>
            <label className={styles.titleField} htmlFor="name">
              <span className={styles.srOnly}>{t('pages.characterEdit.fields.name')}</span>
              <input
                className={styles.titleInput}
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleGeneralChange}
                placeholder={t('pages.characterEdit.placeholders.titleName')}
                autoComplete="off"
              />
            </label>
          </div>
          <Link className={styles.ghostLink} to="/">
            {t('common.actions.backToList')}
          </Link>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('common.states.loadingCharacter')}</p>
        ) : (
          <form className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.sectionsGrid}>
              <GeneralSection form={form} onChange={handleGeneralChange} levelBonusLabel={levelBonusLabel} />
              <AttributesSection
                attributeRows={attributeRows}
                attributesPlus={form.attributesPlus}
                onChange={handleAttributeChange}
              />
              <DefensesSection defenseValues={defenseValues} />
              <SkillSection
                training={form.training}
                skillModifiers={skillModifiers}
                onChange={handleTrainingChange}
              />
            </div>

            <div className={styles.formActions}>
              <Link className={styles.secondaryButton} to="/">
                {t('common.actions.cancel')}
              </Link>
              <button className={styles.primaryButton} type="submit" disabled={saving}>
                <span className={styles.buttonContent}>
                  <AppIcon name="save" />
                  <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                </span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

export function CharacterEditPage() {
  const page = useCharacterEditPage()

  return <CharacterEditPageContent {...page} />
}
