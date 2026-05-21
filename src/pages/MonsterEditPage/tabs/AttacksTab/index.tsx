import { AppIcon } from '@components/AppIcon'
import styles from '../../style.module.scss'
import { AttackCard } from './AttackCard'
import { useAttacksTab } from './attacksTabHooks'
import type { AttacksTabProps } from './types'

export const AttacksTab = (props: AttacksTabProps) => {
  const { activeType, attackBonusOptions, areaOptions, attackTypeTabs, defenseOptions, getAttackHeaderClass, handleAddAttack, onAttackChange, onAttackRemove, setActiveType, t, visibleAttacks } = useAttacksTab(props)

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.attacks.title')}</h2>
      </div>

      <div className={styles.itemsGroupTabsRow}>
        <div className={styles.itemsGroupTabs} role="tablist" aria-label={t('pages.monsterEdit.attacks.typeLabel')}>
          {attackTypeTabs.map((tab) => (
            <button key={tab.value} id={`monster-attacks-tab-${tab.value}`} className={`${styles.itemsGroupTabButton} ${activeType === tab.value ? styles.itemsGroupTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeType === tab.value} aria-controls={`monster-attacks-panel-${tab.value}`} onClick={() => setActiveType(tab.value)}>
              {tab.label}
            </button>
          ))}
        </div>

        <button className={styles.primaryButton} type="button" onClick={handleAddAttack}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus" />
            <span>{t('pages.monsterEdit.attacks.addButton')}</span>
          </span>
        </button>
      </div>

      <div id={`monster-attacks-panel-${activeType}`} role="tabpanel" aria-labelledby={`monster-attacks-tab-${activeType}`}>
        {visibleAttacks.length === 0 ? <p className={styles.loadingText}>{t('pages.monsterEdit.attacks.emptyState')}</p> : null}

        {visibleAttacks.length > 0 ? (
          <div className={styles.attackGrid}>
            {visibleAttacks.map(({ attack, index }) => (
              <AttackCard key={attack.id} attack={attack} attackBonusOptions={attackBonusOptions} areaOptions={areaOptions} defenseOptions={defenseOptions} getAttackHeaderClass={getAttackHeaderClass} index={index} suggested={props.suggested} onAttackChange={onAttackChange} onAttackRemove={onAttackRemove} t={t} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
