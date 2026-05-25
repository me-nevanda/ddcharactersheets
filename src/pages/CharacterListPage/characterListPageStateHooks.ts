import { useI18n } from '@i18n/index';
import { useMainPageContext } from '@pages/main/mainPageContext';
import { useCharacterDialogLabel, useCharacterCardImageError, useCharacterGroupCards, useCharacterListActions, useCharacterListCards, useCharacterListData, } from './characterListPageHooks';
import type { CharacterListPageState, CharacterListTabKey } from './types';
export const useCharacterListPage = (): CharacterListPageState => {
    const { t } = useI18n();
    const { activeCharacterListTab, handleCharacterListTabChange } = useMainPageContext();
    const { characters, error, groups, loading, loadingGroups, setCharacters, setError, setGroups } = useCharacterListData(t);
    const { characterToDelete, creating, creatingGroup, deletingId, groupDeletingId, groupName, groupToDelete, handleCancelCreateGroup, handleChangeGroupName, handleCloseDeleteDialog, handleCloseDeleteGroupDialog, handleConfirmDeleteCharacter, handleConfirmDeleteCharacterGroup, handleCreateCharacter, handleCreateGroupSubmit, handleOpenCreateGroupDialog, handleOpenDeleteDialog, handleOpenDeleteGroupDialog, openCharacter, openGroup, showCreateGroupDialog, } = useCharacterListActions(t, setCharacters, setError, setGroups);
    const cards = useCharacterListCards(characters, deletingId, openCharacter, handleOpenDeleteDialog);
    const handleCardImageError = useCharacterCardImageError();
    const groupCards = useCharacterGroupCards(groups, characters, groupDeletingId, openCharacter, openGroup, handleOpenDeleteGroupDialog, handleCardImageError);
    const deleteDialogCharacterName = useCharacterDialogLabel(characterToDelete);
    return {
        activeTab: activeCharacterListTab,
        cards,
        creating,
        creatingGroup,
        deleteDialogCharacterName,
        deleteDialogGroupName: groupToDelete?.name.trim() || t('pages.characterList.groups.unnamedGroup'),
        deletingId,
        error,
        groupDeletingId,
        groupName,
        groups: groupCards,
        groupToDelete,
        handleCancelCreateGroup,
        handleCardImageError,
        handleChangeGroupName,
        handleCloseDeleteDialog,
        handleCloseDeleteGroupDialog,
        handleConfirmDeleteCharacter,
        handleConfirmDeleteCharacterGroup,
        handleCreateGroupSubmit,
        handleCreateCharacter,
        handleOpenCreateGroupDialog,
        handleOpenDeleteDialog,
        loading,
        loadingGroups,
        characterToDelete,
        setActiveTab: handleCharacterListTabChange as (tab: CharacterListTabKey) => void,
        showCreateGroupDialog,
        showCharacterGrid: !loading && cards.length > 0,
        showEmptyGroupsState: !loadingGroups && groupCards.length === 0,
        showEmptyState: !loading && cards.length === 0,
        showGroupList: !loadingGroups && groupCards.length > 0,
    };
};
