import styles from '../../style.module.scss'
import { AbilityCard } from './AbilityCard'
import { AbilityRemoveDialog } from './AbilityRemoveDialog'
import { useAbilitiesTab } from './useAbilitiesTab'

export function AbilitiesTab() {
  const {
    t,
    form,
    weaponOptions,
    attributeOptions,
    defenseOptions,
    attackBonusOptions,
    weaponDamageTypeOptions,
    weaponAreaOptions,
    pendingRemoval,
    handleAbilityChange,
    handleAddAbility,
    handleRemoveAbility,
    handleConfirmRemoveAbility,
    handleCancelRemoveAbility,
    getAbilityHeaderClass,
  } = useAbilitiesTab()

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
            <AbilityCard
              key={ability.id}
              ability={ability}
              index={index}
              attributeOptions={attributeOptions}
              attackBonusOptions={attackBonusOptions}
              defenseOptions={defenseOptions}
              weaponAreaOptions={weaponAreaOptions}
              weaponDamageTypeOptions={weaponDamageTypeOptions}
              weaponOptions={weaponOptions}
              getAbilityHeaderClass={getAbilityHeaderClass}
              onAbilityChange={handleAbilityChange}
              onRemoveAbility={handleRemoveAbility}
              t={t}
            />
          ))}
        </div>
      ) : null}

      <AbilityRemoveDialog
        pendingRemoval={pendingRemoval}
        onCancel={handleCancelRemoveAbility}
        onConfirm={handleConfirmRemoveAbility}
        t={t}
      />
    </div>
  )
}
