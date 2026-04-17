import styles from '../../style.module.scss'
import { AbilityCard } from './AbilityCard'
import { AbilityRemoveDialog } from './AbilityRemoveDialog'
import { useAbilitiesTab } from './useAbilitiesTab'

export function AbilitiesTab() {
  const {
    t,
    activeType,
    weaponOptions,
    attributeOptions,
    defenseOptions,
    attackBonusOptions,
    weaponDamageTypeOptions,
    weaponAreaOptions,
    visibleAbilities,
    pendingRemoval,
    setActiveType,
    handleAbilityChange,
    handleAddAbility,
    handleRemoveAbility,
    handleConfirmRemoveAbility,
    handleCancelRemoveAbility,
    getAbilityHeaderClass,
  } = useAbilitiesTab()

  const abilityTypeTabs = [
    { value: 'standard', label: t('pages.characterEdit.abilities.typeOptions.standard') },
    { value: 'unlimited', label: t('pages.characterEdit.abilities.typeOptions.unlimited') },
    { value: 'encounter', label: t('pages.characterEdit.abilities.typeOptions.encounter') },
    { value: 'daily', label: t('pages.characterEdit.abilities.typeOptions.daily') },
  ] as const

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.abilities.title')}</h2>
      </div>

      <div className={styles.itemsGroupTabsRow}>
        <div className={styles.itemsGroupTabs} role="tablist" aria-label={t('pages.characterEdit.abilities.typeLabel')}>
          {abilityTypeTabs.map((tab) => (
            <button
              key={tab.value}
              id={`abilities-tab-${tab.value}`}
              className={`${styles.itemsGroupTabButton} ${activeType === tab.value ? styles.itemsGroupTabButtonActive : ''}`}
              type="button"
              role="tab"
              aria-selected={activeType === tab.value}
              aria-controls={`abilities-panel-${tab.value}`}
              onClick={() => setActiveType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className={styles.primaryButton} type="button" onClick={handleAddAbility}>
          {t('pages.characterEdit.abilities.addButton')}
        </button>
      </div>

      <div
        id={`abilities-panel-${activeType}`}
        role="tabpanel"
        aria-labelledby={`abilities-tab-${activeType}`}
      >
        {visibleAbilities.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.abilities.emptyState')}</p> : null}

        {visibleAbilities.length > 0 ? (
          <div className={styles.abilityGrid}>
            {visibleAbilities.map(({ ability, index }) => (
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
      </div>

      <AbilityRemoveDialog
        pendingRemoval={pendingRemoval}
        onCancel={handleCancelRemoveAbility}
        onConfirm={handleConfirmRemoveAbility}
        t={t}
      />
    </div>
  )
}
