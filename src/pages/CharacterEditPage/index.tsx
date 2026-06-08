import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AppIcon } from '@components/AppIcon';
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog';
import { useUnnamedCharacterImageFallback } from '@pages/characterPageHooks';
import { useI18n } from '@i18n/index';
import { CharacterEditPageProvider, useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import { useEditReturnNavigation } from '@pages/useEditReturnNavigation';
import styles from './style.module.scss';
import type { CharacterEditTabKey } from '@pages/CharacterEditPage/types';
import { AbilitiesTab } from '@pages/CharacterEditPage/tabs/AbilitiesTab';
import { GeneralTab } from '@pages/CharacterEditPage/tabs/GeneralTab';
import { FeatsTab } from '@pages/CharacterEditPage/tabs/FeatsTab';
import { ItemsTab } from '@pages/CharacterEditPage/tabs/ItemsTab';
import { HistoryTab } from '@pages/CharacterEditPage/tabs/HistoryTab';
const CharacterEditPageContent = () => {
    const { t } = useI18n();
    const { getCharacterClassSrc, getCharacterPortraitSrc } = useCharacterPresentation();
    const handleImageError = useUnnamedCharacterImageFallback();
    const { characterId = '' } = useParams();
    const { applyReturnTabs, navigateBack, returnTo } = useEditReturnNavigation({
        characterListTab: 'list',
        mainTab: 'heroes',
        returnTo: '/',
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
    const [isPrintMenuOpen, setPrintMenuOpen] = useState(false);
    const printMenuRef = useRef<HTMLDivElement>(null);
    const { error, form, handleGeneralChange, handleImageChange, handleImageRemove, handleSubmit, hasChanges, imageUrl, loading, removingImage, saving, uploadingImage } = useCharacterEditPageContext();
    const activeTab = resolveActiveTab(searchParams.get('tab'));
    useEffect(() => {
        const handleDocumentPointerDown = (event: MouseEvent) => {
            if (printMenuRef.current?.contains(event.target as Node)) {
                return;
            }
            setPrintMenuOpen(false);
        };
        const handleDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPrintMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDocumentPointerDown);
        document.addEventListener('keydown', handleDocumentKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleDocumentPointerDown);
            document.removeEventListener('keydown', handleDocumentKeyDown);
        };
    }, []);
    const handleTabChange = (nextTab: CharacterEditTabKey) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('tab', nextTab);
        setSearchParams(nextParams);
    };
    const handlePrintSheet = () => {
        setPrintMenuOpen(false);
        if (!characterId) {
            return;
        }
        window.open(`/characters/${characterId}/print`, '_blank');
    };
    const handlePrintAbilities = () => {
        setPrintMenuOpen(false);
        if (!characterId) {
            return;
        }
        window.open(`/characters/${characterId}/print/abilities`, '_blank');
    };
    const handlePrintItems = () => {
        setPrintMenuOpen(false);
        if (!characterId) {
            return;
        }
        window.open(`/characters/${characterId}/print/items`, '_blank');
    };
    const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (hasChanges) {
            event.preventDefault();
            setUnsavedChangesDialogOpen(true);
            return;
        }
        applyReturnTabs();
    };
    const handleConfirmBackToList = () => {
        setUnsavedChangesDialogOpen(false);
        navigateBack();
    };
    return (<main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={`${styles.headerPortraitStack} ${imageUrl ? styles.headerPortraitStackCustomImage : styles.headerPortraitStackDefaultImage}`}>
              <input id="character-image-input" className={styles.headerImageInput} type="file" accept="image/png,image/jpeg" onChange={(event) => void handleImageChange(event)} disabled={uploadingImage || removingImage}/>
              {imageUrl ? (<img className={styles.headerCustomPortrait} src={imageUrl} alt={t('pages.characterEdit.fields.image')}/>) : (<label className={styles.headerImageUploadTarget} htmlFor="character-image-input" aria-label={t('pages.characterEdit.fields.image')}>
                  <img className={styles.headerPortrait} src={getCharacterPortraitSrc(form.race, form.gender)} alt="" aria-hidden="true" onError={handleImageError}/>
                  <img className={styles.headerClass} src={getCharacterClassSrc(form.class)} alt="" aria-hidden="true" onError={handleImageError}/>
                </label>)}
              <div className={styles.headerImageActions}>
                <label className={styles.headerImageAction} htmlFor="character-image-input" aria-disabled={uploadingImage || removingImage}>
                  <AppIcon name="edit"/>
                  <span>{t('pages.characterEdit.imageActions.uploadNew')}</span>
                </label>
                {imageUrl ? (<button className={`${styles.headerImageAction} ${styles.headerImageDangerAction}`} type="button" disabled={uploadingImage || removingImage} onClick={() => void handleImageRemove()}>
                    <AppIcon name="trash"/>
                    <span>{t('pages.characterEdit.imageActions.remove')}</span>
                  </button>) : null}
              </div>
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.characterEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="name">
                <span className={styles.srOnly}>{t('pages.characterEdit.fields.name')}</span>
                <input className={styles.titleInput} id="name" name="name" type="text" value={form.name} onChange={handleGeneralChange} placeholder={t('pages.characterEdit.placeholders.titleName')} autoComplete="off"/>
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to={returnTo} onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.printAction} ref={printMenuRef}>
              <button aria-expanded={isPrintMenuOpen} aria-haspopup="menu" className={styles.printPrimaryButton} type="button" onClick={() => setPrintMenuOpen((current) => !current)}>
                <span className={styles.buttonContent}>
                  <AppIcon name="print"/>
                  <span>{t('common.actions.print')}</span>
                </span>
              </button>
              {isPrintMenuOpen ? (<div className={styles.printMenuList} role="menu" aria-label={t('common.actions.print')}>
                  <button className={styles.printMenuItem} type="button" onClick={handlePrintSheet}>
                    {t('pages.characterEdit.printMenu.characterSheet')}
                  </button>
                  <button className={styles.printMenuItem} type="button" onClick={handlePrintAbilities}>
                    {t('pages.characterEdit.printMenu.abilitiesAndFeats')}
                  </button>
                  <button className={styles.printMenuItem} type="button" onClick={handlePrintItems}>
                    {t('pages.characterEdit.printMenu.items')}
                  </button>
                </div>) : null}
            </div>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="character-edit-form" type="submit" disabled={saving || !hasChanges}>
                <span className={styles.buttonContent}>
                  <AppIcon name="save"/>
                  <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (<p className={styles.loadingText}>{t('common.states.loadingCharacter')}</p>) : (<form id="character-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.editorBody}>
              <aside className={styles.tabRail} aria-label={t('pages.characterEdit.title')}>
                <button className={`${styles.tabButton} ${activeTab === 'general' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('general')}>
                  {t('pages.characterEdit.tabs.general')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'abilities' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('abilities')}>
                  {t('pages.characterEdit.tabs.abilities')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'feats' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('feats')}>
                  {t('pages.characterEdit.tabs.feats')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'items' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('items')}>
                  {t('pages.characterEdit.tabs.items')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('history')}>
                  {t('pages.characterEdit.tabs.history')}
                </button>
              </aside>

              <div className={styles.tabPanel}>
                {activeTab === 'general' ? <GeneralTab /> : null}
                {activeTab === 'abilities' ? <AbilitiesTab /> : null}
                {activeTab === 'feats' ? <FeatsTab /> : null}
                {activeTab === 'items' ? <ItemsTab /> : null}
                {activeTab === 'history' ? <HistoryTab /> : null}
              </div>
            </div>
          </form>)}
        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList}/>
      </section>
    </main>);
};
const resolveActiveTab = (tab: string | null): CharacterEditTabKey => {
    if (tab === 'abilities' || tab === 'feats' || tab === 'items' || tab === 'history') {
        return tab;
    }
    return 'general';
};
export const CharacterEditPage = () => {
    return (<CharacterEditPageProvider>
      <CharacterEditPageContent />
    </CharacterEditPageProvider>);
};
