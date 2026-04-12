import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import { useState } from 'react'
import {
  buildAttributeModifierMap,
  buildEffectiveAttributes,
  buildNormalizedAttributes,
} from '../../sections/AttributesSection/attributesSectionLogic'
import styles from '../../style.module.scss'

export function AbilitiesTab() {
  const { t } = useI18n()
  const { form, handleAbilityCreateEmpty, handleAbilityChange, handleAbilityRemove } =
    useCharacterEditPageContext()
  const [pendingRemoval, setPendingRemoval] = useState<{ index: number; name: string } | null>(null)
  const normalizedAttributes = buildNormalizedAttributes(form.attributes)
  const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, form.attributesPlus)
  const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes)
  const weaponOptions = form.items.weapons
    .map((weapon) => weapon.name.trim())
    .filter((weaponName, index, array) => weaponName.length > 0 && array.indexOf(weaponName) === index)
  const attributeOptions = [
    {
      value: 'strength',
      label: `${t('pages.characterEdit.fields.strength')} (${attributeModifierMap.strength})`,
    },
    {
      value: 'condition',
      label: `${t('pages.characterEdit.fields.condition')} (${attributeModifierMap.condition})`,
    },
    {
      value: 'dexterity',
      label: `${t('pages.characterEdit.fields.dexterity')} (${attributeModifierMap.dexterity})`,
    },
    {
      value: 'intelligence',
      label: `${t('pages.characterEdit.fields.intelligence')} (${attributeModifierMap.intelligence})`,
    },
    {
      value: 'wisdom',
      label: `${t('pages.characterEdit.fields.wisdom')} (${attributeModifierMap.wisdom})`,
    },
    {
      value: 'charisma',
      label: `${t('pages.characterEdit.fields.charisma')} (${attributeModifierMap.charisma})`,
    },
  ]

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
          {form.abilities.map((ability, index) => {
            const currentWeaponOptions =
              ability.weaponName.length > 0 && !weaponOptions.includes(ability.weaponName)
                ? [...weaponOptions, ability.weaponName]
                : weaponOptions

            return (
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

                {ability.kind !== 'utility' ? (
                  <div className={styles.abilityField}>
                    <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponLabel')}</span>
                    <div className={styles.abilityWeaponRow}>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponCountSelect}`}
                        id={`ability-weapon-count-${index}`}
                        value={ability.weaponCount}
                        onChange={(event) =>
                          handleAbilityChange(
                            index,
                            'weaponCount',
                            Math.min(10, Math.max(1, Number.parseInt(event.target.value, 10) || 1)),
                          )
                        }
                      >
                        {Array.from({ length: 10 }, (_, count) => count + 1).map((count) => (
                          <option key={count} value={count}>
                            {count}
                          </option>
                        ))}
                      </select>
                      <span className={styles.weaponDamageSeparator}>x</span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponSelect}`}
                        id={`ability-weapon-${index}`}
                        value={ability.weaponName}
                        onChange={(event) => handleAbilityChange(index, 'weaponName', event.target.value)}
                      >
                        <option value="">{t('pages.characterEdit.abilities.weaponOptions.none')}</option>
                        {currentWeaponOptions.map((weaponName) => (
                          <option key={weaponName} value={weaponName}>
                            {weaponName}
                          </option>
                        ))}
                      </select>
                      <span className={styles.weaponDamageSeparator}>+</span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponBonusSelect}`}
                        id={`ability-weapon-bonus-${index}`}
                        value={ability.weaponAttributeBonus}
                        onChange={(event) => handleAbilityChange(index, 'weaponAttributeBonus', event.target.value)}
                      >
                        <option value="">{t('pages.characterEdit.abilities.weaponBonusOptions.none')}</option>
                        {attributeOptions.map((attribute) => (
                          <option key={attribute.value} value={attribute.value}>
                            {`${t('pages.characterEdit.abilities.weaponBonusOptions.prefix')} ${attribute.label}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

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
            )
          })}
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
