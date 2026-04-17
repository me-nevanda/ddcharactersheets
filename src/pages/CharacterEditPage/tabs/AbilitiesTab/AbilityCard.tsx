import { AppIcon } from '@components/AppIcon'
import styles from '../../style.module.scss'
import type { AbilityCardProps } from './types'
import { AbilityActionFields } from './AbilityActionFields'
import { AbilityOffensiveFields } from './AbilityOffensiveFields'

export function AbilityCard({
  ability,
  index,
  attributeOptions,
  attackBonusOptions,
  defenseOptions,
  weaponAreaOptions,
  weaponDamageTypeOptions,
  weaponOptions,
  getAbilityHeaderClass,
  onAbilityChange,
  onRemoveAbility,
  t,
}: AbilityCardProps) {
  return (
    <article className={styles.abilityCard}>
      <div className={`${styles.abilityCardRichHeader} ${getAbilityHeaderClass(ability.type)}`}>
        <input
          className={styles.abilityCardTitleInput}
          id={`ability-name-${index}`}
          value={ability.name}
          placeholder={t('pages.characterEdit.abilities.namePlaceholder')}
          onChange={(event) => onAbilityChange(index, 'name', event.target.value)}
        />
        <button
          className={styles.abilityRemoveButton}
          type="button"
          aria-label={t('pages.characterEdit.abilities.removeButton')}
          title={t('pages.characterEdit.abilities.removeButton')}
          onClick={() => onRemoveAbility(index, ability.name)}
        >
          <AppIcon name="delete" />
        </button>
      </div>

      <AbilityActionFields
        ability={ability}
        index={index}
        weaponAreaOptions={weaponAreaOptions}
        onAbilityChange={onAbilityChange}
        t={t}
      />

      {ability.kind !== 'utility' ? (
        <AbilityOffensiveFields
          ability={ability}
          index={index}
          attributeOptions={attributeOptions}
          attackBonusOptions={attackBonusOptions}
          defenseOptions={defenseOptions}
          weaponDamageTypeOptions={weaponDamageTypeOptions}
          weaponOptions={weaponOptions}
          onAbilityChange={onAbilityChange}
          t={t}
        />
      ) : null}

      <label className={styles.abilityField} htmlFor={`ability-description-${index}`}>
        <div className={styles.divider} data-label={t('pages.characterEdit.abilities.descriptionLabel')} />

        <textarea
          className={`${styles.input} ${styles.abilityTextarea}`}
          id={`ability-description-${index}`}
          value={ability.description}
          onChange={(event) => onAbilityChange(index, 'description', event.target.value)}
        />
      </label>
    </article>
  )
}
