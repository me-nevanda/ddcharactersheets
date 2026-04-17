import { AppIcon } from '@components/AppIcon'
import { skillDefinitions } from '@dictionaries/characterEditDefinitions'
import { type CharacterFeatBonusFieldName } from '../../featsLogic'
import { ItemBonusEditor } from '../ItemsTab/ItemBonusEditor'
import styles from '../../style.module.scss'
import localStyles from './style.module.scss'
import { useFeatsTab } from './useFeatsTab'

const featCoreFields = [
  { fieldName: 'speedBonusNumber', labelKey: 'pages.characterEdit.fields.speed' },
  { fieldName: 'hpBonusNumber', labelKey: 'pages.characterEdit.fields.hp' },
  { fieldName: 'kpBonusNumber', labelKey: 'pages.characterEdit.fields.kp' },
  { fieldName: 'fortitudeBonusNumber', labelKey: 'pages.characterEdit.fields.fortitude' },
  { fieldName: 'reflexBonusNumber', labelKey: 'pages.characterEdit.fields.reflex' },
  { fieldName: 'willBonusNumber', labelKey: 'pages.characterEdit.fields.will' },
] satisfies ReadonlyArray<{ fieldName: CharacterFeatBonusFieldName; labelKey: string }>

const featSkillFields = skillDefinitions.map((skill) => ({
  fieldName: `${skill.key}BonusNumber` as CharacterFeatBonusFieldName,
  labelKey: skill.translationKey,
})) satisfies ReadonlyArray<{ fieldName: CharacterFeatBonusFieldName; labelKey: string }>

const featBonusFields = [...featCoreFields, ...featSkillFields]

export function FeatsTab() {
  const {
    t,
    form,
    handleFeatChange,
    handleFeatBonusFieldChange,
    pendingRemoval,
    handleAddFeat,
    handleRemoveFeat,
    handleConfirmRemoveFeat,
    handleCancelRemoveFeat,
  } = useFeatsTab()

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.feats.title')}</h2>
        <button className={styles.primaryButton} type="button" onClick={handleAddFeat}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus" />
            <span>{t('pages.characterEdit.feats.addButton')}</span>
          </span>
        </button>
      </div>

      {form.feats.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.feats.emptyState')}</p> : null}

      {form.feats.length > 0 ? (
        <div className={localStyles.featsGrid}>
          {form.feats.map((feat, index) => (
            <article key={feat.id} className={styles.abilityCard}>
              <div className={`${styles.sectionHeader} ${localStyles.featCardHeader}`}>
                <input
                  className={styles.abilityCardTitleInput}
                  id={`feat-name-${index}`}
                  value={feat.name}
                  placeholder={t('pages.characterEdit.feats.namePlaceholder')}
                  onChange={(event) => handleFeatChange(index, 'name', event.target.value)}
                />
                <div className={styles.itemCardActions}>
                  <button
                    className={`${styles.weaponEquipButton} ${
                      feat.visible ? styles.weaponEquipButtonActive : styles.weaponEquipButtonInactive
                    }`}
                    type="button"
                    aria-pressed={feat.visible}
                    aria-label="Widoczność na wydruku"
                    title="Widoczność na wydruku"
                    onClick={() => handleFeatChange(index, 'visible', !feat.visible)}
                  >
                    <AppIcon name={feat.visible ? 'check' : 'circle'} />
                  </button>
                  <button
                    className={styles.abilityRemoveButton}
                    type="button"
                    aria-label={t('pages.characterEdit.feats.removeButton')}
                    title={t('pages.characterEdit.feats.removeButton')}
                    onClick={() => handleRemoveFeat(index)}
                  >
                    <AppIcon name="delete" />
                  </button>
                </div>
              </div>

              <div className={localStyles.featCardBody}>
                <label className={localStyles.featDescriptionField} htmlFor={`feat-description-${index}`}>
                  <div className={styles.divider} data-label={t('pages.characterEdit.feats.descriptionLabel')} />
                  <textarea
                    className={`${styles.input} ${styles.abilityTextarea}`}
                    id={`feat-description-${index}`}
                    value={feat.description}
                    placeholder={t('pages.characterEdit.feats.descriptionPlaceholder')}
                    onChange={(event) => handleFeatChange(index, 'description', event.target.value)}
                  />
                </label>

                <ItemBonusEditor
                  bonusFields={featBonusFields}
                  getBonusValue={(fieldName) => feat[fieldName]}
                  idPrefix={`feat-${index}`}
                  onBonusFieldChange={(previousFieldName, nextFieldName) =>
                    handleFeatBonusFieldChange(index, previousFieldName, nextFieldName)
                  }
                  onBonusValueChange={(fieldName, value) => handleFeatChange(index, fieldName, value)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {pendingRemoval ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-feat-title">
            <h2 className={styles.deleteDialogTitle} id="delete-feat-title">
              {t('pages.characterEdit.feats.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.characterEdit.feats.removeDialog.body', {
                name: form.feats[pendingRemoval.index]?.name || t('pages.characterEdit.feats.title'),
              })}
            </p>

            <div className={styles.deleteDialogActions}>
              <button className={styles.deleteDialogSecondaryButton} type="button" onClick={handleCancelRemoveFeat}>
                {t('common.actions.cancel')}
              </button>
              <button className={styles.deleteDialogDangerButton} type="button" onClick={handleConfirmRemoveFeat}>
                {t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
