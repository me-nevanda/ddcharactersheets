import { AppIcon } from '@components/AppIcon';
import { useI18n } from '@i18n/index';
import type { CharacterListHeaderProps } from './types';
import styles from './style.module.scss';
export const CharacterListHeader = ({ actionLabel, creating, onAction, onSecondaryAction, secondaryActionLabel, secondaryCreating = false, subtitle, title, }: CharacterListHeaderProps) => {
    const { t } = useI18n();
    return (<header className={styles.hero}>
      <div><img className={styles.headerLogo} src="/favicon.png" alt="" aria-hidden="true"/></div>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{subtitle}</p>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.actions}>
        <button className={styles.primaryButton} type="button" onClick={onAction} disabled={creating}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus"/>
            <span>{creating ? t('common.states.creating') : actionLabel}</span>
          </span>
        </button>
        {onSecondaryAction && secondaryActionLabel ? (<button className={styles.secondaryButton} type="button" onClick={onSecondaryAction} disabled={secondaryCreating}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus"/>
            <span>{secondaryCreating ? t('common.states.creating') : secondaryActionLabel}</span>
          </span>
        </button>) : null}
      </div>
    </header>);
};
