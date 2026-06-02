import { AppIcon } from '@components/AppIcon'
import toast from 'react-hot-toast'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import styles from '../../style.module.scss'
import type { AttackCardProps } from './types'

const formatSuggestedValue = (value: string): string => {
  return value.trim()
}

const copySuggestedDamageMarker = async (value: string, t: AttackCardProps['t']) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(t('common.clipboard.damageCopied'))
  } catch {
    toast.error(t('common.clipboard.copyFailed'))
  }
}

export const AttackCard = ({ attack, attackBonusOptions, areaOptions, defenseOptions, getAttackHeaderClass, index, suggested, onAttackChange, onAttackRemove, t }: AttackCardProps) => {
  const attackVsKp = formatSuggestedValue(suggested.attackVsKp)
  const attackVsOtherDefenses = formatSuggestedValue(suggested.attackVsOtherDefenses)
  const lowDamage = formatSuggestedValue(suggested.lowDamage)
  const mediumDamage = formatSuggestedValue(suggested.mediumDamage)
  const highDamage = formatSuggestedValue(suggested.highDamage)
  const customDamage = formatSuggestedValue(suggested.customDamage)
  const showAttackSuggestion = attackVsKp || attackVsOtherDefenses
  const showDamageSuggestion = lowDamage || mediumDamage || highDamage || customDamage
  const damageSuggestions = [
    { marker: t('pages.npcEdit.fields.low'), value: lowDamage },
    { marker: t('pages.npcEdit.fields.medium'), value: mediumDamage },
    { marker: t('pages.npcEdit.fields.high'), value: highDamage },
    { marker: t('pages.npcEdit.fields.custom'), value: customDamage },
  ].filter((suggestion) => suggestion.value)

  return (
    <article className={styles.attackCard}>
      <div className={`${styles.attackCardHeader} ${getAttackHeaderClass(attack.type)}`}>
        <input className={styles.attackCardTitleInput} id={`npc-attack-name-${index}`} value={attack.name} placeholder={t('pages.npcEdit.attacks.namePlaceholder')} onChange={(event) => onAttackChange(index, 'name', event.target.value)} />
        <button className={styles.attackRemoveButton} type="button" aria-label={t('pages.npcEdit.attacks.removeButton')} title={t('pages.npcEdit.attacks.removeButton')} onClick={() => onAttackRemove(index)}>
          <AppIcon name="delete" />
        </button>
      </div>

      <div className={styles.attackField}>
        <div className={styles.divider} data-label={t('pages.characterEdit.abilities.actionLabel')} />
        <div className={styles.attackActionRow}>
          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.attackActionSelect}`} id={`npc-attack-action-${index}`} value={attack.action} onChange={(event) => onAttackChange(index, 'action', event.target.value === 'noAction' ? 'noAction' : 'action')}>
            <option value="action">{t('pages.characterEdit.abilities.actionOptions.action')}</option>
            <option value="noAction">{t('pages.characterEdit.abilities.actionOptions.noAction')}</option>
          </select>
        </div>
      </div>

      <div className={styles.attackField}>
        <div className={styles.divider} data-label={t('pages.characterEdit.abilities.areaLabel')} />
        <div className={styles.attackActionRow}>
          <label className={styles.attackInlineField} htmlFor={`npc-attack-range-${index}`}>
            <span className={styles.attackLabel}>{t('pages.characterEdit.abilities.weaponRangeLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.attackRangeSelect}`} id={`npc-attack-range-${index}`} value={attack.range} onChange={(event) => onAttackChange(index, 'range', Number.parseInt(event.target.value, 10) || 0)}>
              {Array.from({ length: 31 }, (_, count) => count).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.attackInlineField} htmlFor={`npc-attack-area-${index}`}>
            <span className={styles.attackLabel}>{t('pages.characterEdit.abilities.weaponAreaLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.attackAreaSelect}`} id={`npc-attack-area-${index}`} value={attack.area} onChange={(event) => onAttackChange(index, 'area', event.target.value)}>
              {areaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.attackField}>
        <div className={styles.divider} data-label={t('pages.npcEdit.attacks.attackLabel')} />
        {showAttackSuggestion ? (
          <p className={styles.attackSuggestion}>
            <span className={styles.attackSuggestionLabel}>{t('pages.npcEdit.fields.attack')}</span>
            {attackVsKp ? (
              <span>{t('pages.npcEdit.fields.vsKp')}: {attackVsKp}</span>
            ) : null}
            {attackVsKp && attackVsOtherDefenses ? <span>,</span> : null}
            {attackVsOtherDefenses ? (
              <span>{t('pages.npcEdit.fields.vsOtherDefenses')}: {attackVsOtherDefenses}</span>
            ) : null}
          </p>
        ) : null}
        <div className={styles.attackTargetRow}>
          <label className={styles.attackInlineField} htmlFor={`npc-attack-bonus-${index}`}>
            <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponAttackBonusLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.attackBonusSelect}`} id={`npc-attack-bonus-${index}`} value={attack.attackBonusNumber} onChange={(event) => onAttackChange(index, 'attackBonusNumber', Number.parseInt(event.target.value, 10) || 0)}>
              {attackBonusOptions.map((bonus) => (
                <option key={bonus} value={bonus}>
                  {bonus === 0 ? '0' : `+${bonus}`}
                </option>
              ))}
            </select>
          </label>

          <span className={styles.attackLabel}>{t('pages.characterEdit.abilities.weaponAgainstLabel')}</span>

          <label className={styles.attackInlineField} htmlFor={`npc-attack-defense-${index}`}>
            <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponAttackDefenseLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.attackDefenseSelect}`} id={`npc-attack-defense-${index}`} value={attack.attackDefense} onChange={(event) => onAttackChange(index, 'attackDefense', event.target.value)}>
              {defenseOptions.map((defense) => (
                <option key={defense.value} value={defense.value}>
                  {defense.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.attackNotApplicableField} htmlFor={`npc-attack-not-applicable-${index}`}>
            <input className={styles.attackNotApplicableInput} id={`npc-attack-not-applicable-${index}`} type="checkbox" checked={attack.attackNotApplicable} onChange={(event) => onAttackChange(index, 'attackNotApplicable', event.target.checked)} />
            <span className={styles.attackNotApplicableLabel}>{t('pages.npcEdit.attacks.notApplicable')}</span>
          </label>
        </div>
      </div>

      <div className={styles.attackField}>
        <div className={styles.divider} data-label={t('pages.characterEdit.abilities.descriptionLabel')} />
        {showDamageSuggestion ? (
          <p className={styles.attackSuggestion}>
            <span className={styles.attackSuggestionLabel}>{t('pages.npcEdit.fields.damage')}</span>
            {damageSuggestions.map((suggestion, suggestionIndex) => (
              <span key={suggestion.marker}>
                {suggestionIndex > 0 ? <span>, </span> : null}
                <button className={styles.attackSuggestionCopyButton} type="button" title={t('common.clipboard.copyDamageValue')} onClick={() => void copySuggestedDamageMarker(suggestion.marker, t)}>
                  {suggestion.marker}
                </button>: {suggestion.value}
              </span>
            ))}
          </p>
        ) : null}
        <SimpleWysiwygEditor ariaLabel={t('pages.characterEdit.abilities.descriptionLabel')} minHeightClassName={styles.attackTextarea} name={`npc-attack-description-${index}`} placeholder={t('pages.npcEdit.attacks.descriptionPlaceholder')} toolbar={false} value={attack.description} onChange={(value) => onAttackChange(index, 'description', value)} />
      </div>
    </article>
  )
}
