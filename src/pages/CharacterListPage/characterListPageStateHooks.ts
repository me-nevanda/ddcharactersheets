import { useI18n } from '@i18n/index';
import { useCharacterDialogLabel, useCharacterCardImageError, useCharacterListActions, useCharacterListCards, useCharacterListData, } from './characterListPageHooks';
import type { CharacterListPageState } from './types';
export const useCharacterListPage = (): CharacterListPageState => {
    const { t } = useI18n();
    const { characters, error, loading, setCharacters, setError } = useCharacterListData(t);
    const { characterToDelete, creating, deletingId, handleCloseDeleteDialog, handleConfirmDeleteCharacter, handleCreateCharacter, handleOpenDeleteDialog, openCharacter, } = useCharacterListActions(t, setCharacters, setError);
    const cards = useCharacterListCards(characters, deletingId, openCharacter, handleOpenDeleteDialog);
    const handleCardImageError = useCharacterCardImageError();
    const deleteDialogCharacterName = useCharacterDialogLabel(characterToDelete);
    return {
        cards,
        creating,
        deleteDialogCharacterName,
        deletingId,
        error,
        handleCardImageError,
        loading,
        characterToDelete,
        handleCloseDeleteDialog,
        handleConfirmDeleteCharacter,
        handleCreateCharacter,
        handleOpenDeleteDialog,
        showCharacterGrid: !loading && cards.length > 0,
        showEmptyState: !loading && cards.length === 0,
    };
};
