import type { CharacterFeat } from '../../types/character';
export type CharacterFeatBonusFieldName = Exclude<keyof CharacterFeat, 'id' | 'name' | 'description' | 'visible'>;
export interface FeatBonusSource {
    name: string;
    bonus: number;
    visible: boolean;
}
export const sumFeatBonus = (feats: CharacterFeat[], fieldName: CharacterFeatBonusFieldName): number => {
    return feats.reduce((total, feat) => total + feat[fieldName], 0);
};
export const buildFeatBonusSources = (feats: CharacterFeat[], fieldName: CharacterFeatBonusFieldName): FeatBonusSource[] => {
    return feats
        .map((feat) => ({
        name: feat.name.trim() || '—',
        bonus: feat[fieldName],
        visible: feat.visible,
    }))
        .filter((source) => source.bonus !== 0);
};
