import { AppIcon } from '@components/AppIcon';
import { useI18n } from '@i18n/index';
import type { CharacterListHeaderProps } from './types';
import styles from './style.module.scss';
export const CharacterListHeader = ({ creating, onCreateCharacter, }: CharacterListHeaderProps) => {
    const { t } = useI18n();
    return (<header className={styles.hero}>
      <div><img className={styles.headerLogo} src="/favicon.png" alt="" aria-hidden="true"/></div>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{t('pages.characterList.eyebrow')}</p>
        <h1 className={styles.title}>{t('pages.characterList.title')}</h1>
      </div>
      <button className={styles.primaryButton} type="button" onClick={onCreateCharacter} disabled={creating}>
        <span className={styles.buttonContent}>
          <AppIcon name="plus"/>
          <span>{creating ? t('common.states.creating') : t('common.actions.addCard')}</span>
        </span>
      </button>
    </header>);
};
