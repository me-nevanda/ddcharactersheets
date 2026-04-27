import { useState } from 'react';
import { useI18n } from '@i18n/index';
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext';
import type { PendingFeatRemoval } from './types';
export const useFeatsTab = () => {
    const { t } = useI18n();
    const { form, handleFeatChange, handleFeatBonusFieldChange, handleFeatCreateEmpty, handleFeatRemove } = useCharacterEditPageContext();
    const [pendingRemoval, setPendingRemoval] = useState<PendingFeatRemoval | null>(null);
    const handleAddFeat = () => {
        handleFeatCreateEmpty();
    };
    const handleRemoveFeat = (index: number) => {
        setPendingRemoval({ index });
    };
    const handleConfirmRemoveFeat = () => {
        if (!pendingRemoval) {
            return;
        }
        handleFeatRemove(pendingRemoval.index);
        setPendingRemoval(null);
    };
    const handleCancelRemoveFeat = () => {
        setPendingRemoval(null);
    };
    return {
        t,
        form,
        handleFeatChange,
        handleFeatBonusFieldChange,
        pendingRemoval,
        handleAddFeat,
        handleRemoveFeat,
        handleConfirmRemoveFeat,
        handleCancelRemoveFeat,
    };
};
