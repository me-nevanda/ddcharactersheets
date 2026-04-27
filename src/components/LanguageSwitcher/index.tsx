import { useI18n } from '@i18n/index';
import styles from './style.module.scss';
const locales = ['pl', 'en'] as const;
export const LanguageSwitcher = () => {
    const { locale, setLocale, t } = useI18n();
    return (<div className={`${styles.switcher} language-switcher`} aria-label={t('common.language')}>
      {locales.map((localeOption) => (<button key={localeOption} className={`${styles.button} ${locale === localeOption ? styles.buttonActive : ''}`} type="button" onClick={() => setLocale(localeOption)}>
          {t(`common.languages.${localeOption}`)}
        </button>))}
    </div>);
};
