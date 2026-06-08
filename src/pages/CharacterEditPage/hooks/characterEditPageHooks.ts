import { useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '@i18n/index';
import { deleteCharacterImage, uploadCharacterImage } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import { emptyForm } from '@pages/CharacterEditPage/characterEditPageUtils';
import { useCharacterEditPageDerivedState } from './characterEditPageDerivedStateHooks';
import { useCharacterEditPageFormHandlers, useCharacterEditPageClassTrainingRules } from './characterEditPageFormHandlersHooks';
import { useCharacterEditPageLoad } from './characterEditPageLoadHooks';
import { useCharacterEditPageSubmitHandler } from './characterEditPageSubmitHooks';
import type { CharacterHistoryEntry } from '@appTypes/character';
import type { CharacterEditFormData, CharacterEditPageState } from '../types';

export const useCharacterEditPage = (): CharacterEditPageState => {
    const { t } = useI18n();
    const { getClassLabel, getRaceLabel } = useCharacterPresentation();
    const { characterId = '' } = useParams();
    const [form, setForm] = useState<CharacterEditFormData>(emptyForm);
    const [initialForm, setInitialForm] = useState<CharacterEditFormData>(emptyForm);
    const [historyEntries, setHistoryEntries] = useState<CharacterHistoryEntry[]>([]);
    const [initialHistoryEntries, setInitialHistoryEntries] = useState<CharacterHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [removingImage, setRemovingImage] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useCharacterEditPageLoad(characterId, setForm, setInitialForm, setHistoryEntries, setInitialHistoryEntries, setError, setImageUrl, setLoading, t);
    useCharacterEditPageClassTrainingRules(form.class, setForm);

    const handlers = useCharacterEditPageFormHandlers(setForm);
    const computedState = useCharacterEditPageDerivedState(form, initialForm, historyEntries, initialHistoryEntries, t, getRaceLabel, getClassLabel);
    const handleSubmit = useCharacterEditPageSubmitHandler({
        characterId,
        computedState,
        form,
        historyEntries,
        setError,
        setHistoryEntries,
        setInitialForm,
        setInitialHistoryEntries,
        setSaving,
        t,
    });
    const handleHistoryEntryCreateEmpty = () => {
        setHistoryEntries((currentEntries) => [
            ...currentEntries,
            {
                id: globalThis.crypto.randomUUID(),
                title: '',
                content: '',
            },
        ]);
    };
    const handleHistoryEntryChange = (index: number, fieldName: 'title' | 'content', value: string) => {
        setHistoryEntries((currentEntries) => currentEntries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [fieldName]: value } : entry)));
    };
    const handleHistoryEntryRemove = (index: number) => {
        setHistoryEntries((currentEntries) => currentEntries.filter((_entry, entryIndex) => entryIndex !== index));
    };
    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files?.[0];
        event.target.value = '';
        if (!image) {
            return;
        }
        setUploadingImage(true);
        setError('');
        try {
            const character = await uploadCharacterImage(characterId, image);
            setImageUrl(character.imageUrl ? `${character.imageUrl}?v=${Date.now()}` : '');
        }
        catch (nextError) {
            setError(getErrorMessage(t, nextError));
        }
        finally {
            setUploadingImage(false);
        }
    };
    const handleImageRemove = async () => {
        if (!imageUrl || removingImage) {
            return;
        }
        setRemovingImage(true);
        setError('');
        try {
            const character = await deleteCharacterImage(characterId);
            setImageUrl(character.imageUrl);
        }
        catch (nextError) {
            setError(getErrorMessage(t, nextError));
        }
        finally {
            setRemovingImage(false);
        }
    };

    return {
        error,
        form,
        historyEntries,
        imageUrl,
        loading,
        removingImage,
        saving,
        uploadingImage,
        attributeBonuses: computedState.attributeBonuses,
        attributeBonusTooltips: computedState.attributeBonusTooltips,
        handleGeneralChange: handlers.handleGeneralChange,
        handleImageChange,
        handleImageRemove,
        handleGeneralFieldChange: handlers.handleGeneralFieldChange,
        handleAttributeChange: handlers.handleAttributeChange,
        handleTrainingChange: handlers.handleTrainingChange,
        handleAbilityCreateEmpty: handlers.handleAbilityCreateEmpty,
        handleAbilityAdd: handlers.handleAbilityAdd,
        handleAbilityChange: handlers.handleAbilityChange,
        handleAbilityRemove: handlers.handleAbilityRemove,
        handleFeatCreateEmpty: handlers.handleFeatCreateEmpty,
        handleFeatChange: handlers.handleFeatChange,
        handleFeatBonusFieldChange: handlers.handleFeatBonusFieldChange,
        handleFeatRemove: handlers.handleFeatRemove,
        handleHistoryEntryCreateEmpty,
        handleHistoryEntryChange,
        handleHistoryEntryRemove,
        handleItemCreateEmpty: handlers.handleItemCreateEmpty,
        handleItemChange: handlers.handleItemChange,
        handleItemBonusFieldChange: handlers.handleItemBonusFieldChange,
        handleArmorBonusChange: handlers.handleArmorBonusChange,
        handleWeaponDamageChange: handlers.handleWeaponDamageChange,
        handleItemRemove: handlers.handleItemRemove,
        handleSubmit,
        attributeRows: computedState.attributeRows,
        levelBonusLabel: computedState.levelBonusLabel,
        speedValue: computedState.speedValue,
        speedTooltip: computedState.speedTooltip,
        hpTooltip: computedState.hpTooltip,
        skillModifiers: computedState.skillModifiers,
        defenseValues: computedState.defenseValues,
        defenseTooltips: computedState.defenseTooltips,
        hpValue: computedState.hpValue,
        surgeValue: computedState.surgeValue,
        hasChanges: computedState.hasChanges,
    };
};
