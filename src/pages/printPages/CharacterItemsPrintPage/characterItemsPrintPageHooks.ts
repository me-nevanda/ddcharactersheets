import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '@i18n/index';
import { useCharacterById, useCharacterDocumentTitle } from '@pages/characterPageHooks';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import type { CharacterItemsPrintPageState, PrintItemRow } from './types';
const buildItemRows = (items: Array<{
    name: string;
    description: string;
}>, category: PrintItemRow['category']): PrintItemRow[] => {
    return items
        .filter((item) => item.name.trim().length > 0 || item.description.trim().length > 0)
        .map((item, index) => ({
        key: `${item.name.trim() || 'item'}-${index}`,
        name: item.name,
        description: item.description,
        category,
    }));
};
export const useCharacterItemsPrintPage = (): CharacterItemsPrintPageState => {
    const { t } = useI18n();
    const { getCharacterLabel } = useCharacterPresentation();
    const { characterId = '' } = useParams();
    const { character, loading, error } = useCharacterById(characterId, t);
    useCharacterDocumentTitle(t('pages.characterItemsPrint.title'), character?.name);
    const computedState = useMemo<CharacterItemsPrintPageState>(() => {
        if (!character) {
            return {
                loading,
                error,
                character,
                title: t('pages.characterItemsPrint.title'),
                characterName: getCharacterLabel(null),
                hasItems: false,
                armors: [],
                weapons: [],
                others: [],
            };
        }
        const armors = buildItemRows(character.items.armors, 'armor');
        const weapons = buildItemRows(character.items.weapons, 'weapon');
        const others = buildItemRows(character.items.others, 'other');
        return {
            loading,
            error,
            character,
            title: t('pages.characterItemsPrint.title'),
            characterName: getCharacterLabel(character.name),
            hasItems: armors.length > 0 || weapons.length > 0 || others.length > 0,
            armors,
            weapons,
            others,
        };
    }, [character, error, getCharacterLabel, loading, t]);
    return computedState;
};
