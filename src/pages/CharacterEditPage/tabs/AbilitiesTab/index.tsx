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
  const weaponDamageTypeOptions = [
    { value: 'normal', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.normal') },
    { value: 'acid', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.acid') },
    { value: 'cold', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.cold') },
    { value: 'fire', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.fire') },
    { value: 'force', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.force') },
    { value: 'lightning', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.lightning') },
    { value: 'necrotic', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.necrotic') },
    { value: 'poison', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.poison') },
    { value: 'psychic', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.psychic') },
    { value: 'radiant', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.radiant') },
    { value: 'thunder', label: t('pages.characterEdit.abilities.weaponDamageTypeOptions.thunder') },
  ]

  function buildAbilityDamage(ability: (typeof form.abilities)[number]) {
    const attributeLabelMap: Record<string, string> = {
      strength: t('pages.characterEdit.fields.strength'),
      condition: t('pages.characterEdit.fields.condition'),
      dexterity: t('pages.characterEdit.fields.dexterity'),
      intelligence: t('pages.characterEdit.fields.intelligence'),
      wisdom: t('pages.characterEdit.fields.wisdom'),
      charisma: t('pages.characterEdit.fields.charisma'),
    }

    const damageTypeLabelMap: Record<string, string> = {
      normal: t('pages.characterEdit.abilities.weaponDamageTypeOptions.normal'),
      acid: t('pages.characterEdit.abilities.weaponDamageTypeOptions.acid'),
      cold: t('pages.characterEdit.abilities.weaponDamageTypeOptions.cold'),
      fire: t('pages.characterEdit.abilities.weaponDamageTypeOptions.fire'),
      force: t('pages.characterEdit.abilities.weaponDamageTypeOptions.force'),
      lightning: t('pages.characterEdit.abilities.weaponDamageTypeOptions.lightning'),
      necrotic: t('pages.characterEdit.abilities.weaponDamageTypeOptions.necrotic'),
      poison: t('pages.characterEdit.abilities.weaponDamageTypeOptions.poison'),
      psychic: t('pages.characterEdit.abilities.weaponDamageTypeOptions.psychic'),
      radiant: t('pages.characterEdit.abilities.weaponDamageTypeOptions.radiant'),
      thunder: t('pages.characterEdit.abilities.weaponDamageTypeOptions.thunder'),
    }

    const damageParts = [
      ability.weaponDamageDiceType && ability.weaponDamageDiceCount > 0
        ? `${ability.weaponDamageDiceCount}${ability.weaponDamageDiceType}`
        : '',
      ability.weaponAttributeBonus ? `${t('pages.characterEdit.abilities.weaponBonusOptions.prefix')} ${attributeLabelMap[ability.weaponAttributeBonus] ?? ''}` : '',
      damageTypeLabelMap[ability.weaponDamageType] ?? '',
    ].filter((part) => part.length > 0)

    return damageParts.join(' + ')
  }

  const weaponAreaOptions = [
    { value: 'point', label: t('pages.characterEdit.abilities.weaponAreaOptions.point') },
    ...Array.from({ length: 10 }, (_, index) => index + 1).flatMap((count) => [
      { value: `burst${count}`, label: `${t('pages.characterEdit.abilities.weaponAreaOptions.burst')} ${count}` },
    ]),
    ...Array.from({ length: 10 }, (_, index) => index + 1).map((count) => ({
      value: `blast${count}`,
      label: `${t('pages.characterEdit.abilities.weaponAreaOptions.blast')} ${count}`,
    })),
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

                <div className={styles.abilityField}>
                  <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.actionLabel')}</span>
                  <div className={styles.abilityActionRow}>
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
                    <label className={styles.abilityActionTypeGroup} htmlFor={`ability-type-${index}`}>
                      <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.typeLabel')}</span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityActionTypeSelect}`}
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
                    </label>
                    <label className={styles.abilityActionKindGroup} htmlFor={`ability-kind-${index}`}>
                      <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.kindLabel')}</span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityActionKindSelect}`}
                        id={`ability-kind-${index}`}
                        value={ability.kind}
                        onChange={(event) =>
                          handleAbilityChange(index, 'kind', event.target.value === 'utility' ? 'utility' : 'offensive')
                        }
                      >
                        <option value="offensive">{t('pages.characterEdit.abilities.kindOptions.offensive')}</option>
                        <option value="utility">{t('pages.characterEdit.abilities.kindOptions.utility')}</option>
                      </select>
                    </label>
                    <label className={styles.abilityActionDistanceGroup} htmlFor={`ability-weapon-range-${index}`}>
                      <span className={styles.attributeLabel}>
                        {t('pages.characterEdit.abilities.weaponRangeLabel')}
                      </span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponRangeSelect}`}
                        id={`ability-weapon-range-${index}`}
                        value={ability.weaponRange}
                        onChange={(event) =>
                          handleAbilityChange(index, 'weaponRange', Number.parseInt(event.target.value, 10) || 0)
                        }
                      >
                        {Array.from({ length: 31 }, (_, count) => count).map((count) => (
                          <option key={count} value={count}>
                            {count}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.abilityActionAreaGroup} htmlFor={`ability-weapon-area-${index}`}>
                      <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponAreaLabel')}</span>
                      <select
                        className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponAreaSelect}`}
                        id={`ability-weapon-area-${index}`}
                        value={ability.weaponArea}
                        onChange={(event) => handleAbilityChange(index, 'weaponArea', event.target.value)}
                      >
                        {weaponAreaOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {ability.kind !== 'utility' ? (
                  <div className={styles.abilityField}>
                    <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponLabel')}</span>
                    <div className={styles.abilityWeaponStack}>
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
                          onChange={(event) => {
                            const nextWeaponName = event.target.value

                            handleAbilityChange(index, 'weaponName', nextWeaponName)

                            if (nextWeaponName.length === 0) {
                              handleAbilityChange(index, 'weaponDamageDiceType', '')
                              handleAbilityChange(index, 'weaponDamageDiceCount', 0)
                            }
                          }}
                        >
                          <option value="">{t('pages.characterEdit.abilities.weaponOptions.none')}</option>
                          {currentWeaponOptions.map((weaponName) => (
                            <option key={weaponName} value={weaponName}>
                              {weaponName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.abilityWeaponRowSecondary}>
                        <label className={styles.abilityWeaponDiceGroup} htmlFor={`ability-weapon-dice-${index}`}>
                          <span className={styles.srOnly}>
                            {t('pages.characterEdit.abilities.weaponDamageDiceLabel')}
                          </span>
                          <select
                            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDiceSelect}`}
                            id={`ability-weapon-dice-${index}`}
                            value={ability.weaponDamageDiceType}
                            onChange={(event) =>
                              handleAbilityChange(index, 'weaponDamageDiceType', event.target.value)
                            }
                          >
                            <option value="">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.none')}</option>
                            <option value="d4">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d4')}</option>
                            <option value="d6">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d6')}</option>
                            <option value="d8">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d8')}</option>
                            <option value="d10">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d10')}</option>
                            <option value="d12">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d12')}</option>
                            <option value="d20">{t('pages.characterEdit.abilities.weaponDamageDiceOptions.d20')}</option>
                          </select>
                        </label>
                        <span className={styles.weaponDamageSeparator}>+</span>
                        <label className={styles.abilityWeaponCountGroup} htmlFor={`ability-weapon-dice-count-${index}`}>
                          <span className={styles.srOnly}>
                            {t('pages.characterEdit.abilities.weaponDamageCountLabel')}
                          </span>
                          <select
                            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageCountSelect}`}
                            id={`ability-weapon-dice-count-${index}`}
                            value={ability.weaponDamageDiceCount}
                            onChange={(event) =>
                              handleAbilityChange(
                                index,
                                'weaponDamageDiceCount',
                                Math.min(20, Math.max(0, Number.parseInt(event.target.value, 10) || 0)),
                              )
                            }
                          >
                            {Array.from({ length: 21 }, (_, count) => count).map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                        </label>
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
                        <span className={styles.weaponDamageSeparator}>+</span>
                        <label className={styles.abilityWeaponCountGroup} htmlFor={`ability-weapon-damage-type-${index}`}>
                          <span className={styles.srOnly}>
                            {t('pages.characterEdit.abilities.weaponDamageTypeLabel')}
                          </span>
                          <select
                            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageTypeSelect}`}
                            id={`ability-weapon-damage-type-${index}`}
                            value={ability.weaponDamageType}
                            onChange={(event) => handleAbilityChange(index, 'weaponDamageType', event.target.value)}
                          >
                            {weaponDamageTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          </select>
                        </label>
                      </div>

                      <div className={styles.abilityWeaponTextAreaSoloRow}>
                        <div className={styles.abilityWeaponTextAreaField}>
                          <span className={styles.attributeLabel}>
                            {t('pages.characterEdit.abilities.weaponRecurringDamageLabel')}
                          </span>
                          <div className={styles.abilityWeaponRowSecondary}>
                            <label
                              className={styles.abilityWeaponCountGroup}
                              htmlFor={`ability-weapon-recurring-count-${index}`}
                            >
                              <span className={styles.srOnly}>
                                {t('pages.characterEdit.abilities.weaponDamageCountLabel')}
                              </span>
                              <select
                                className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageCountSelect}`}
                                id={`ability-weapon-recurring-count-${index}`}
                                value={ability.weaponRecurringDamageCount}
                                onChange={(event) =>
                                  handleAbilityChange(
                                    index,
                                    'weaponRecurringDamageCount',
                                    Math.min(10, Math.max(0, Number.parseInt(event.target.value, 10) || 0)),
                                  )
                                }
                              >
                                {Array.from({ length: 11 }, (_, count) => count).map((count) => (
                                  <option key={count} value={count}>
                                    {count}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <select
                              className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageTypeSelect}`}
                              id={`ability-weapon-recurring-type-${index}`}
                              value={ability.weaponRecurringDamageType}
                              onChange={(event) =>
                                handleAbilityChange(index, 'weaponRecurringDamageType', event.target.value)
                              }
                            >
                              {weaponDamageTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {ability.weaponName.length > 0 ? (
                        <div className={styles.abilityDamageSection}>
                          <span className={styles.attributeLabel}>{t('pages.characterEdit.fields.damage')}</span>
                          <strong className={styles.abilityDamageValue}>{buildAbilityDamage(ability)}</strong>
                        </div>
                      ) : null}

                      <div className={styles.abilityWeaponTextAreaSoloRow}>
                        <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-provocation-${index}`}>
                          <span className={styles.attributeLabel}>
                            {t('pages.characterEdit.abilities.weaponProvocationLabel')}
                          </span>
                          <textarea
                            className={`${styles.input} ${styles.abilityWeaponTextArea}`}
                            id={`ability-weapon-provocation-${index}`}
                            value={ability.weaponProvocation}
                            onChange={(event) => handleAbilityChange(index, 'weaponProvocation', event.target.value)}
                          />
                        </label>
                      </div>

                      <div className={styles.abilityWeaponTextAreaFullRow}>
                        <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-hit-${index}`}>
                          <span className={styles.attributeLabel}>
                            {t('pages.characterEdit.abilities.weaponHitLabel')}
                          </span>
                          <textarea
                            className={`${styles.input} ${styles.abilityWeaponTextArea} ${styles.abilityWeaponTextAreaFull}`}
                            id={`ability-weapon-hit-${index}`}
                            value={ability.weaponHit}
                            onChange={(event) => handleAbilityChange(index, 'weaponHit', event.target.value)}
                          />
                        </label>
                      </div>

                      <div className={styles.abilityWeaponTextAreaFullRow}>
                        <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-miss-${index}`}>
                          <span className={styles.attributeLabel}>
                            {t('pages.characterEdit.abilities.weaponMissLabel')}
                          </span>
                          <textarea
                            className={`${styles.input} ${styles.abilityWeaponTextArea} ${styles.abilityWeaponTextAreaFull}`}
                            id={`ability-weapon-miss-${index}`}
                            value={ability.weaponMiss}
                            onChange={(event) => handleAbilityChange(index, 'weaponMiss', event.target.value)}
                          />
                        </label>
                      </div>
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
