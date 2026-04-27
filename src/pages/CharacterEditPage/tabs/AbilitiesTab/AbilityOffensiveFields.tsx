import styles from '../../style.module.scss';
import type { AbilityOffensiveFieldsProps } from './types';
export const AbilityOffensiveFields = ({ ability, index, attributeOptions, attackBonusOptions, defenseOptions, weaponDamageTypeOptions, weaponOptions, onAbilityChange, t, }: AbilityOffensiveFieldsProps) => {
    const currentWeaponOptions = ability.weaponName.length > 0 && !weaponOptions.includes(ability.weaponName)
        ? [...weaponOptions, ability.weaponName]
        : weaponOptions;
    return (<div className={styles.abilityField}>
      <div className={styles.divider} data-label={t('pages.characterEdit.abilities.attackLabel')}/>
      <div className={styles.abilityWeaponStack}>
        <div className={styles.abilityWeaponTargetRow}>
          <label className={styles.abilityWeaponTargetGroup} htmlFor={`ability-weapon-attack-attribute-${index}`}>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponTargetSelect}`} id={`ability-weapon-attack-attribute-${index}`} value={ability.weaponAttackAttribute} onChange={(event) => onAbilityChange(index, 'weaponAttackAttribute', event.target.value)}>
              {attributeOptions.map((attribute) => (<option key={attribute.value} value={attribute.value}>
                  {attribute.label}
                </option>))}
            </select>
          </label>
          <div className={styles.abilityWeaponAttackBonusGroup}>
            <div className={styles.abilityWeaponAttackBonusControl}>
              <span className={styles.attributeLabel}>+</span>
              <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponAttackBonusSelect}`} id={`ability-weapon-attack-bonus-${index}`} value={ability.weaponAttackBonusNumber} onChange={(event) => onAbilityChange(index, 'weaponAttackBonusNumber', Number.parseInt(event.target.value, 10) || 0)}>
                {attackBonusOptions.map((bonus) => (<option key={bonus} value={bonus}>
                    {bonus}
                  </option>))}
              </select>
            </div>
          </div>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponAgainstLabel')}</span>
          <label className={styles.abilityWeaponTargetGroup} htmlFor={`ability-weapon-attack-defense-${index}`}>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponTargetSelect}`} id={`ability-weapon-attack-defense-${index}`} value={ability.weaponAttackDefense} onChange={(event) => onAbilityChange(index, 'weaponAttackDefense', event.target.value)}>
              {defenseOptions.map((defense) => (<option key={defense.value} value={defense.value}>
                  {defense.label}
                </option>))}
            </select>
          </label>
        </div>
        <div className={styles.divider} data-label={t('pages.characterEdit.abilities.weaponLabel')}/>
        <div className={styles.abilityWeaponRow}>
          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponCountSelect}`} id={`ability-weapon-count-${index}`} value={ability.weaponCount} onChange={(event) => onAbilityChange(index, 'weaponCount', Math.min(10, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))}>
            {Array.from({ length: 10 }, (_, count) => count + 1).map((count) => (<option key={count} value={count}>
                {count}
              </option>))}
          </select>
          <span className={styles.weaponDamageSeparator}>x</span>
          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponSelect}`} id={`ability-weapon-${index}`} value={ability.weaponName} onChange={(event) => {
            const nextWeaponName = event.target.value;
            onAbilityChange(index, 'weaponName', nextWeaponName);
            if (nextWeaponName.length === 0) {
                onAbilityChange(index, 'weaponDamageDiceType', '');
                onAbilityChange(index, 'weaponDamageDiceCount', 0);
            }
        }}>
            <option value="">{t('pages.characterEdit.abilities.weaponOptions.none')}</option>
            {currentWeaponOptions.map((weaponName) => (<option key={weaponName} value={weaponName}>
                {weaponName}
              </option>))}
          </select>
        </div>

        <div className={styles.abilityWeaponRowSecondary}>
          <label className={styles.abilityWeaponDiceGroup} htmlFor={`ability-weapon-dice-${index}`}>
            <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponDamageDiceLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDiceSelect}`} id={`ability-weapon-dice-${index}`} value={ability.weaponDamageDiceType} onChange={(event) => onAbilityChange(index, 'weaponDamageDiceType', event.target.value)}>
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
            <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponDamageCountLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageCountSelect}`} id={`ability-weapon-dice-count-${index}`} value={ability.weaponDamageDiceCount} onChange={(event) => onAbilityChange(index, 'weaponDamageDiceCount', Math.min(20, Math.max(0, Number.parseInt(event.target.value, 10) || 0)))}>
              {Array.from({ length: 21 }, (_, count) => count).map((count) => (<option key={count} value={count}>
                  {count}
                </option>))}
            </select>
          </label>
          <span className={styles.weaponDamageSeparator}>+</span>
          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponBonusSelect}`} id={`ability-weapon-bonus-${index}`} value={ability.weaponAttributeBonus} onChange={(event) => onAbilityChange(index, 'weaponAttributeBonus', event.target.value)}>
            <option value="">{t('pages.characterEdit.abilities.weaponBonusOptions.none')}</option>
            {attributeOptions.map((attribute) => (<option key={attribute.value} value={attribute.value}>
                {`${t('pages.characterEdit.abilities.weaponBonusOptions.prefix')} ${attribute.label}`}
              </option>))}
          </select>
          <span className={styles.weaponDamageSeparator}>+</span>
          <label className={styles.abilityWeaponCountGroup} htmlFor={`ability-weapon-damage-type-${index}`}>
            <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponDamageTypeLabel')}</span>
            <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageTypeSelect}`} id={`ability-weapon-damage-type-${index}`} value={ability.weaponDamageType} onChange={(event) => onAbilityChange(index, 'weaponDamageType', event.target.value)}>
              {weaponDamageTypeOptions.map((option) => (<option key={option.value} value={option.value}>
                  {option.label}
                </option>))}
            </select>
          </label>
        </div>

        <div className={styles.abilityWeaponTextAreaSoloRow}>
          <div className={styles.abilityWeaponTextAreaField}>
            <div className={styles.divider} data-label={t('pages.characterEdit.abilities.weaponRecurringDamageLabel')}/>
            <div className={styles.abilityWeaponRowSecondary}>
              <label className={styles.abilityWeaponCountGroup} htmlFor={`ability-weapon-recurring-count-${index}`}>
                <span className={styles.srOnly}>{t('pages.characterEdit.abilities.weaponDamageCountLabel')}</span>
                <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageCountSelect}`} id={`ability-weapon-recurring-count-${index}`} value={ability.weaponRecurringDamageCount} onChange={(event) => onAbilityChange(index, 'weaponRecurringDamageCount', Math.min(10, Math.max(0, Number.parseInt(event.target.value, 10) || 0)))}>
                  {Array.from({ length: 11 }, (_, count) => count).map((count) => (<option key={count} value={count}>
                      {count}
                    </option>))}
                </select>
              </label>
              <select className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponDamageTypeSelect}`} id={`ability-weapon-recurring-type-${index}`} value={ability.weaponRecurringDamageType} onChange={(event) => onAbilityChange(index, 'weaponRecurringDamageType', event.target.value)}>
                {weaponDamageTypeOptions.map((option) => (<option key={option.value} value={option.value}>
                    {option.label}
                  </option>))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.abilityWeaponTextAreaSoloRow}>
          <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-provocation-${index}`}>
            <div className={styles.divider} data-label={t('pages.characterEdit.abilities.weaponProvocationLabel')}/>
            <textarea className={`${styles.input} ${styles.abilityWeaponTextArea}`} id={`ability-weapon-provocation-${index}`} value={ability.weaponProvocation} onChange={(event) => onAbilityChange(index, 'weaponProvocation', event.target.value)}/>
          </label>
        </div>

        <div className={styles.abilityWeaponTextAreaFullRow}>
          <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-hit-${index}`}>
            <div className={styles.divider} data-label={t('pages.characterEdit.abilities.weaponHitLabel')}/>
            <textarea className={`${styles.input} ${styles.abilityWeaponTextArea} ${styles.abilityWeaponTextAreaFull}`} id={`ability-weapon-hit-${index}`} value={ability.weaponHit} onChange={(event) => onAbilityChange(index, 'weaponHit', event.target.value)}/>
          </label>
        </div>

        <div className={styles.abilityWeaponTextAreaFullRow}>
          <label className={styles.abilityWeaponTextAreaField} htmlFor={`ability-weapon-miss-${index}`}>
            <div className={styles.divider} data-label={t('pages.characterEdit.abilities.weaponMissLabel')}/>
            <textarea className={`${styles.input} ${styles.abilityWeaponTextArea} ${styles.abilityWeaponTextAreaFull}`} id={`ability-weapon-miss-${index}`} value={ability.weaponMiss} onChange={(event) => onAbilityChange(index, 'weaponMiss', event.target.value)}/>
          </label>
        </div>
      </div>
    </div>);
};
