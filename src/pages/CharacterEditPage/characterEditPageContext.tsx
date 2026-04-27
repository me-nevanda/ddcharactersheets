import { createContext, useContext, type PropsWithChildren } from 'react';
import { useCharacterEditPage } from './useCharacterEditPage';
import type { CharacterEditPageState } from './types';
const CharacterEditPageContext = createContext<CharacterEditPageState | null>(null);
export const CharacterEditPageProvider = ({ children }: PropsWithChildren) => {
    const pageState = useCharacterEditPage();
    return <CharacterEditPageContext.Provider value={pageState}>{children}</CharacterEditPageContext.Provider>;
};
export const useCharacterEditPageContext = (): CharacterEditPageState => {
    const context = useContext(CharacterEditPageContext);
    if (!context) {
        throw new Error('CharacterEditPageContext is not available');
    }
    return context;
};
