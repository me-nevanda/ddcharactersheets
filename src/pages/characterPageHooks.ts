import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { getCharacter } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { useCharacterPresentation } from '@pages/characterPresentationHooks';
import type { Character } from '../types/character';
export const useCharacterById = (characterId: string, t: (key: string) => string) => {
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        const loadCharacter = async () => {
            try {
                const nextCharacter = await getCharacter(characterId);
                if (!cancelled) {
                    setCharacter(nextCharacter);
                    setError('');
                }
            }
            catch (nextError) {
                if (!cancelled) {
                    setError(getErrorMessage(t, nextError));
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        void loadCharacter();
        return () => {
            cancelled = true;
        };
    }, [characterId, t]);
    return {
        character,
        error,
        loading,
        setCharacter,
        setError,
    };
};
export const useCharacterDocumentTitle = (title: string, characterName: string | null | undefined) => {
    const { getCharacterLabel } = useCharacterPresentation();
    useEffect(() => {
        if (!characterName) {
            return;
        }
        document.title = `${title} - ${getCharacterLabel(characterName)}`;
    }, [characterName, getCharacterLabel, title]);
};
export const useUnnamedCharacterImageFallback = () => {
    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.src = '/unnamed.png';
    };
    return handleImageError;
};
