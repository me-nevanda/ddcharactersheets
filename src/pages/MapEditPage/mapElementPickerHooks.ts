import { useMemo } from 'react'
import type { MapElementCategory, MapElementVariant } from '@appTypes/map'
import { elementAssetOptions, elementCategories } from './mapEditPageOptions'

type Translate = (key: string, values?: Record<string, string>) => string

export const useMapElementPickerCategories = (
  selectedElementVariantByCategory: Record<MapElementCategory, MapElementVariant>,
  t: Translate,
) => {
  return useMemo(() => elementCategories.map((category) => {
    const categoryLabel = t(`pages.mapEdit.elementCategories.${category}`)
    const treeVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementTreeVariants.deciduous'),
      '2': t('pages.mapEdit.elementTreeVariants.coniferous'),
      '3': t('pages.mapEdit.elementTreeVariants.fantasy'),
      '4': t('pages.mapEdit.elementTreeVariants.modeled'),
      '5': t('pages.mapEdit.elementTreeVariants.fallen'),
      '6': t('pages.mapEdit.elementTreeVariants.stump'),
    }
    const bushVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementBushVariants.regular'),
      '2': t('pages.mapEdit.elementBushVariants.yellowFlowers'),
      '3': t('pages.mapEdit.elementBushVariants.whiteFlowers'),
      '4': t('pages.mapEdit.elementBushVariants.threeSmall'),
      '5': t('pages.mapEdit.elementBushVariants.hedge'),
      '6': t('pages.mapEdit.elementBushVariants.plants'),
      '7': t('pages.mapEdit.elementBushVariants.twoSmall'),
      '8': t('pages.mapEdit.elementBushVariants.fruit'),
    }
    const stairVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementStairVariants.upDownStairs'),
      '2': t('pages.mapEdit.elementStairVariants.leftRightStairs'),
      '3': t('pages.mapEdit.elementStairVariants.ladderUp'),
      '4': t('pages.mapEdit.elementStairVariants.ladderDown'),
      '5': t('pages.mapEdit.elementStairVariants.entranceUp'),
      '6': t('pages.mapEdit.elementStairVariants.descentDown'),
    }
    const furnitureVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementFurnitureVariants.shelf'),
      '2': t('pages.mapEdit.elementFurnitureVariants.cabinet'),
      '3': t('pages.mapEdit.elementFurnitureVariants.tableDesk'),
      '4': t('pages.mapEdit.elementFurnitureVariants.bed'),
      '5': t('pages.mapEdit.elementFurnitureVariants.couch'),
      '6': t('pages.mapEdit.elementFurnitureVariants.armchair'),
      '7': t('pages.mapEdit.elementFurnitureVariants.chair'),
      '8': t('pages.mapEdit.elementFurnitureVariants.fireplace'),
      '9': t('pages.mapEdit.elementFurnitureVariants.shopCounter'),
      '10': t('pages.mapEdit.elementFurnitureVariants.smallTable'),
      '11': t('pages.mapEdit.elementFurnitureVariants.altar'),
    }
    const stoneVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementStoneVariants.rubble'),
      '2': t('pages.mapEdit.elementStoneVariants.rocks'),
      '3': t('pages.mapEdit.elementStoneVariants.threeStones'),
      '4': t('pages.mapEdit.elementStoneVariants.menhirs'),
      '5': t('pages.mapEdit.elementStoneVariants.largeStone'),
      '6': t('pages.mapEdit.elementStoneVariants.mossyStone'),
      '7': t('pages.mapEdit.elementStoneVariants.crackedStone'),
      '8': t('pages.mapEdit.elementStoneVariants.magicStone'),
      '9': t('pages.mapEdit.elementStoneVariants.stoneWall'),
    }
    const monsterVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementMonsterVariants.guardian'),
      '2': t('pages.mapEdit.elementMonsterVariants.knight'),
      '3': t('pages.mapEdit.elementMonsterVariants.wizard'),
      '4': t('pages.mapEdit.elementMonsterVariants.monk'),
      '5': t('pages.mapEdit.elementMonsterVariants.bard'),
      '6': t('pages.mapEdit.elementMonsterVariants.priest'),
      '7': t('pages.mapEdit.elementMonsterVariants.warlock'),
      '8': t('pages.mapEdit.elementMonsterVariants.hunter'),
      '9': t('pages.mapEdit.elementMonsterVariants.rogue'),
      '10': t('pages.mapEdit.elementMonsterVariants.paladin'),
      '11': t('pages.mapEdit.elementMonsterVariants.human'),
      '12': t('pages.mapEdit.elementMonsterVariants.elf'),
      '13': t('pages.mapEdit.elementMonsterVariants.dwarf'),
      '14': t('pages.mapEdit.elementMonsterVariants.halfling'),
      '15': t('pages.mapEdit.elementMonsterVariants.tiefling'),
      '16': t('pages.mapEdit.elementMonsterVariants.draconian'),
      '17': t('pages.mapEdit.elementMonsterVariants.zombie'),
      '18': t('pages.mapEdit.elementMonsterVariants.goblin'),
      '19': t('pages.mapEdit.elementMonsterVariants.kobold'),
      '20': t('pages.mapEdit.elementMonsterVariants.thug'),
      '21': t('pages.mapEdit.elementMonsterVariants.dragon'),
      '22': t('pages.mapEdit.elementMonsterVariants.wolf'),
      '23': t('pages.mapEdit.elementMonsterVariants.beast'),
      '24': t('pages.mapEdit.elementMonsterVariants.demon'),
      '25': t('pages.mapEdit.elementMonsterVariants.skeleton'),
      '26': t('pages.mapEdit.elementMonsterVariants.ghost'),
      '27': t('pages.mapEdit.elementMonsterVariants.insect'),
      '28': t('pages.mapEdit.elementMonsterVariants.mummy'),
      '29': t('pages.mapEdit.elementMonsterVariants.orc'),
      '30': t('pages.mapEdit.elementMonsterVariants.golem'),
    }
    const miscVariantLabels: Partial<Record<MapElementVariant, string>> = {
      '1': t('pages.mapEdit.elementMiscVariants.chest'),
      '2': t('pages.mapEdit.elementMiscVariants.vase'),
      '3': t('pages.mapEdit.elementMiscVariants.woodenCrate'),
      '4': t('pages.mapEdit.elementMiscVariants.campfire'),
      '5': t('pages.mapEdit.elementMiscVariants.drainGrate'),
      '6': t('pages.mapEdit.elementMiscVariants.column'),
      '7': t('pages.mapEdit.elementMiscVariants.brokenColumn'),
      '8': t('pages.mapEdit.elementMiscVariants.well'),
      '9': t('pages.mapEdit.elementMiscVariants.fountain'),
      '10': t('pages.mapEdit.elementMiscVariants.barrel'),
      '11': t('pages.mapEdit.elementMiscVariants.signpost'),
      '12': t('pages.mapEdit.elementMiscVariants.stalagmite'),
      '13': t('pages.mapEdit.elementMiscVariants.stalactite'),
      '14': t('pages.mapEdit.elementMiscVariants.crystal'),
      '15': t('pages.mapEdit.elementMiscVariants.statue'),
      '16': t('pages.mapEdit.elementMiscVariants.cart'),
      '17': t('pages.mapEdit.elementMiscVariants.camp'),
      '18': t('pages.mapEdit.elementMiscVariants.remainsCorpse'),
      '19': t('pages.mapEdit.elementMiscVariants.haystack'),
    }

    return {
      key: category,
      label: t('pages.mapEdit.elementCategoryLabel', { category: categoryLabel }),
      selectedVariant: selectedElementVariantByCategory[category],
      options: elementAssetOptions.filter((option) => option.category === category).map((option) => ({
        ...option,
        label: option.category === 'trees'
          ? treeVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
          : option.category === 'bushes'
            ? bushVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
            : option.category === 'stairs'
              ? stairVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
              : option.category === 'furnitures'
                ? furnitureVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
                : option.category === 'stones'
                  ? stoneVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
                  : option.category === 'monsters'
                    ? monsterVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
                    : option.category === 'misc'
                      ? miscVariantLabels[option.variant] ?? t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant })
                      : t('pages.mapEdit.elementAssetLabel', { category: categoryLabel, number: option.variant }),
      })),
    }
  }), [selectedElementVariantByCategory, t])
}

