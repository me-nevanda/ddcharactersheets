import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { pl } from './locales/pl';
import type { Locale, TranslationDictionary, TranslationVariables } from './types';
const STORAGE_KEY = 'did.locale';
const FALLBACK_LOCALE: Locale = 'pl';
const dictionaries: Record<Locale, TranslationDictionary> = {
    en,
    pl,
};
const localeToIntl: Record<Locale, string> = {
    en: 'en-US',
    pl: 'pl-PL',
};
interface I18nContextValue {
    locale: Locale;
    setLocale: (nextLocale: string) => void;
    t: (key: string, variables?: TranslationVariables) => string;
}
const I18nContext = createContext<I18nContextValue | null>(null);
const isLocale = (locale: string): locale is Locale => {
    return locale in dictionaries;
};
const normalizeLocale = (locale: string | undefined): Locale => {
    if (typeof locale !== 'string') {
        return FALLBACK_LOCALE;
    }
    const shortLocale = locale.toLowerCase().split('-')[0];
    return isLocale(shortLocale) ? shortLocale : FALLBACK_LOCALE;
};
const getInitialLocale = (): Locale => {
    if (typeof window === 'undefined') {
        return FALLBACK_LOCALE;
    }
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (storedLocale) {
        return normalizeLocale(storedLocale);
    }
    return normalizeLocale(window.navigator.language);
};
const getValueByPath = (object: unknown, path: string): unknown => {
    return path.split('.').reduce<unknown>((currentValue, key) => {
        if (typeof currentValue !== 'object' || currentValue === null) {
            return undefined;
        }
        return (currentValue as Record<string, unknown>)[key];
    }, object);
};
const interpolate = (template: string, variables: TranslationVariables): string => {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => String(variables[key] ?? ''));
};
export const translate = (locale: string, key: string, variables: TranslationVariables = {}): string => {
    const dictionary = dictionaries[normalizeLocale(locale)];
    const fallbackDictionary = dictionaries[FALLBACK_LOCALE];
    const value = getValueByPath(dictionary, key) ?? getValueByPath(fallbackDictionary, key) ?? key;
    if (typeof value !== 'string') {
        return key;
    }
    return interpolate(value, variables);
};
export const getIntlLocale = (locale: string): string => {
    return localeToIntl[normalizeLocale(locale)];
};
interface I18nProviderProps {
    children: ReactNode;
}
export const I18nProvider = ({ children }: I18nProviderProps) => {
    const [locale, setLocale] = useState<Locale>(getInitialLocale);
    useEffect(() => {
        const nextLocale = normalizeLocale(locale);
        window.localStorage.setItem(STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
    }, [locale]);
    return (<I18nContext.Provider value={{
            locale,
            setLocale: (nextLocale) => setLocale(normalizeLocale(nextLocale)),
            t: (key, variables) => translate(locale, key, variables),
        }}>
      {children}
    </I18nContext.Provider>);
};
export const useI18n = (): I18nContextValue => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
};
