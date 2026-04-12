import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import { useState } from 'react'
import styles from '../../style.module.scss'

export function AbilitiesTab() {
  const { t } = useI18n()
  const { form, handleAbilityCreateEmpty, handleAbilityChange, handleAbilityRemove } =
    useCharacterEditPageContext()
  const [pendingRemoval, setPendingRemoval] = useState<{ index: number; name: string } | null>(null)

  function handleAddAbility() {
    handleAbilityCreateEmpty()
  }

  function handleRemoveAbility(index: number, abilityName: string) {
    setPendingRemoval({
      index,
      name: abilityName || t('pages.characterEdit.abilities.title'),
    })
  }

  function handleConfirmRemoveAbility() {
    if (!pendingRemoval) {
      return
    }

    handleAbilityRemove(pendingRemoval.index)
    setPendingRemoval(null)
  }

  function handleCancelRemoveAbility() {
    setPendingRemoval(null)
  }

  function getAbilityHeaderClass(type: 'unlimited' | 'encounter' | 'daily') {
    if (type === 'encounter') {
      return styles.abilityHeaderEncounter
    }

    if (type === 'daily') {
      return styles.abilityHeaderDaily
    }

    return styles.abilityHeaderUnlimited
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.abilities.title')}</h2>
      </div>

      <div className={styles.abilityActions}>
        <button className={styles.primaryButton} type="button" onClick={handleAddAbility}>
          {t('pages.characterEdit.abilities.addButton')}
        </button>
      </div>

      {form.abilities.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.abilities.emptyState')}</p> : null}

      {form.abilities.length > 0 ? (
        <div className={styles.abilityGrid}>
          {form.abilities.map((ability, index) => (
            <article className={styles.abilityCard} key={ability.id}>
              <div className={`${styles.abilityCardHeader} ${getAbilityHeaderClass(ability.type)}`}>
                <input
                  className={styles.abilityCardTitleInput}
                  id={`ability-name-${index}`}
                  value={ability.name}
                  placeholder={t('pages.characterEdit.abilities.namePlaceholder')}
                  onChange={(event) => handleAbilityChange(index, 'name', event.target.value)}
                />
                <select
                  className={styles.abilityHeaderSelect}
                  id={`ability-type-${index}`}
                  value={ability.type}
                  onChange={(event) =>
                    handleAbilityChange(
                      index,
                      'type',
                      event.target.value === 'encounter' || event.target.value === 'daily'
                        ? event.target.value
                        : 'unlimited',
                    )
                  }
                >
                  <option value="unlimited">{t('pages.characterEdit.abilities.typeOptions.unlimited')}</option>
                  <option value="encounter">{t('pages.characterEdit.abilities.typeOptions.encounter')}</option>
                  <option value="daily">{t('pages.characterEdit.abilities.typeOptions.daily')}</option>
                </select>
                <select
                  className={styles.abilityHeaderSelect}
                  id={`ability-kind-${index}`}
                  value={ability.kind}
                  onChange={(event) =>
                    handleAbilityChange(index, 'kind', event.target.value === 'utility' ? 'utility' : 'offensive')
                  }
                >
                  <option value="offensive">{t('pages.characterEdit.abilities.kindOptions.offensive')}</option>
                  <option value="utility">{t('pages.characterEdit.abilities.kindOptions.utility')}</option>
                </select>
                <button
                  className={styles.abilityRemoveButton}
                  type="button"
                  aria-label={t('pages.characterEdit.abilities.removeButton')}
                  title={t('pages.characterEdit.abilities.removeButton')}
                  onClick={() => handleRemoveAbility(index, ability.name)}
                >
                  <AppIcon name="delete" />
                </button>
              </div>

              <label className={styles.abilityField} htmlFor={`ability-action-${index}`}>
                <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.actionLabel')}</span>
                <select
                  className={`${styles.input} ${styles.selectChevronInset} ${styles.abilitySelect}`}
                  id={`ability-action-${index}`}
                  value={ability.action}
                  onChange={(event) =>
                    handleAbilityChange(index, 'action', event.target.value === 'noAction' ? 'noAction' : 'action')
                  }
                >
                  <option value="action">{t('pages.characterEdit.abilities.actionOptions.action')}</option>
                  <option value="noAction">{t('pages.characterEdit.abilities.actionOptions.noAction')}</option>
                </select>
              </label>

              <label className={styles.abilityField} htmlFor={`ability-description-${index}`}>
                <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.descriptionLabel')}</span>
                <textarea
                  className={`${styles.input} ${styles.abilityTextarea}`}
                  id={`ability-description-${index}`}
                  value={ability.description}
                  onChange={(event) => handleAbilityChange(index, 'description', event.target.value)}
                />
              </label>
            </article>
          ))}
        </div>
      ) : null}

      {pendingRemoval ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div
            className={styles.deleteDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ability-title"
          >
            <h2 className={styles.deleteDialogTitle} id="delete-ability-title">
              {t('pages.characterEdit.abilities.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.characterEdit.abilities.removeDialog.body', {
                name: pendingRemoval.name,
              })}
            </p>

            <div className={styles.deleteDialogActions}>
              <button
                className={styles.deleteDialogSecondaryButton}
                type="button"
                onClick={handleCancelRemoveAbility}
              >
                {t('common.actions.cancel')}
              </button>
              <button
                className={styles.deleteDialogDangerButton}
                type="button"
                onClick={handleConfirmRemoveAbility}
              >
                {t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
