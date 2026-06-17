import type { MapElementCategory, MapElementVariant, MapGroundTexture } from '@appTypes/map'
import type { MapDrawModeOption, MapElementAssetOption, MapGroundTextureOption, MapLayerOption, MapPaletteColorOption } from './types'
import bushElement1 from '../../images/elements/bushes/1.png'
import bushElement2 from '../../images/elements/bushes/2.png'
import bushElement3 from '../../images/elements/bushes/3.png'
import bushElement4 from '../../images/elements/bushes/4.png'
import bushElement5 from '../../images/elements/bushes/5.png'
import bushElement6 from '../../images/elements/bushes/6.png'
import bushElement7 from '../../images/elements/bushes/7.png'
import bushElement8 from '../../images/elements/bushes/8.png'
import treeElement1 from '../../images/elements/trees/1.png'
import treeElement2 from '../../images/elements/trees/2.png'
import treeElement3 from '../../images/elements/trees/3.png'
import treeElement4 from '../../images/elements/trees/4.png'
import treeElement5 from '../../images/elements/trees/5.png'
import treeElement6 from '../../images/elements/trees/6.png'
import stairElement1 from '../../images/elements/stairs/1.png'
import stairElement2 from '../../images/elements/stairs/2.png'
import stairElement3 from '../../images/elements/stairs/3.png'
import stairElement4 from '../../images/elements/stairs/4.png'
import stairElement5 from '../../images/elements/stairs/5.png'
import stairElement6 from '../../images/elements/stairs/6.png'
import furnitureElement1 from '../../images/elements/furnitures/1.png'
import furnitureElement2 from '../../images/elements/furnitures/2.png'
import furnitureElement3 from '../../images/elements/furnitures/3.png'
import furnitureElement4 from '../../images/elements/furnitures/4.png'
import furnitureElement5 from '../../images/elements/furnitures/5.png'
import furnitureElement6 from '../../images/elements/furnitures/6.png'
import furnitureElement7 from '../../images/elements/furnitures/7.png'
import furnitureElement8 from '../../images/elements/furnitures/8.png'
import furnitureElement9 from '../../images/elements/furnitures/9.png'
import furnitureElement10 from '../../images/elements/furnitures/10.png'
import furnitureElement11 from '../../images/elements/furnitures/11.png'
import miscElement1 from '../../images/elements/misc/1.png'
import miscElement2 from '../../images/elements/misc/2.png'
import miscElement3 from '../../images/elements/misc/3.png'
import miscElement4 from '../../images/elements/misc/4.png'
import miscElement5 from '../../images/elements/misc/5.png'
import miscElement6 from '../../images/elements/misc/6.png'
import miscElement7 from '../../images/elements/misc/7.png'
import miscElement8 from '../../images/elements/misc/8.png'
import miscElement9 from '../../images/elements/misc/9.png'
import miscElement10 from '../../images/elements/misc/10.png'
import miscElement11 from '../../images/elements/misc/11.png'
import miscElement12 from '../../images/elements/misc/12.png'
import miscElement13 from '../../images/elements/misc/13.png'
import miscElement14 from '../../images/elements/misc/14.png'
import miscElement15 from '../../images/elements/misc/15.png'
import miscElement16 from '../../images/elements/misc/16.png'
import miscElement17 from '../../images/elements/misc/17.png'
import miscElement18 from '../../images/elements/misc/18.png'
import miscElement19 from '../../images/elements/misc/19.png'
import stoneElement1 from '../../images/elements/stones/1.png'
import stoneElement2 from '../../images/elements/stones/2.png'
import stoneElement3 from '../../images/elements/stones/3.png'
import stoneElement4 from '../../images/elements/stones/4.png'
import stoneElement5 from '../../images/elements/stones/5.png'
import stoneElement6 from '../../images/elements/stones/6.png'
import stoneElement7 from '../../images/elements/stones/7.png'
import stoneElement8 from '../../images/elements/stones/8.png'
import stoneElement9 from '../../images/elements/stones/9.png'
import monsterElement1 from '../../images/elements/monsters/1.png'
import monsterElement2 from '../../images/elements/monsters/2.png'
import monsterElement3 from '../../images/elements/monsters/3.png'
import monsterElement4 from '../../images/elements/monsters/4.png'
import monsterElement5 from '../../images/elements/monsters/5.png'
import monsterElement6 from '../../images/elements/monsters/6.png'
import monsterElement7 from '../../images/elements/monsters/7.png'
import monsterElement8 from '../../images/elements/monsters/8.png'
import monsterElement9 from '../../images/elements/monsters/9.png'
import monsterElement10 from '../../images/elements/monsters/10.png'
import monsterElement11 from '../../images/elements/monsters/11.png'
import monsterElement12 from '../../images/elements/monsters/12.png'
import monsterElement13 from '../../images/elements/monsters/13.png'
import monsterElement14 from '../../images/elements/monsters/14.png'
import monsterElement15 from '../../images/elements/monsters/15.png'
import monsterElement16 from '../../images/elements/monsters/16.png'
import monsterElement17 from '../../images/elements/monsters/17.png'
import monsterElement18 from '../../images/elements/monsters/18.png'
import monsterElement19 from '../../images/elements/monsters/19.png'
import monsterElement20 from '../../images/elements/monsters/20.png'
import monsterElement21 from '../../images/elements/monsters/21.png'
import monsterElement22 from '../../images/elements/monsters/22.png'
import monsterElement23 from '../../images/elements/monsters/23.png'
import monsterElement24 from '../../images/elements/monsters/24.png'
import monsterElement25 from '../../images/elements/monsters/25.png'
import monsterElement26 from '../../images/elements/monsters/26.png'
import monsterElement27 from '../../images/elements/monsters/27.png'
import monsterElement28 from '../../images/elements/monsters/28.png'
import monsterElement29 from '../../images/elements/monsters/29.png'
import monsterElement30 from '../../images/elements/monsters/30.png'
import groundTexture1 from '../../images/grounds/1.png'
import groundTexture2 from '../../images/grounds/2.png'
import groundTexture3 from '../../images/grounds/3.png'
import groundTexture4 from '../../images/grounds/4.png'
import groundTexture5 from '../../images/grounds/5.png'
import groundTexture6 from '../../images/grounds/6.png'
import groundTexture7 from '../../images/grounds/7.png'
import groundTexture8 from '../../images/grounds/8.png'
import groundTexture9 from '../../images/grounds/9.png'
import groundTexture10 from '../../images/grounds/10.png'
import groundTexture11 from '../../images/grounds/11.png'
import groundTexture12 from '../../images/grounds/12.png'
import groundTexture13 from '../../images/grounds/13.png'
import groundTexture14 from '../../images/grounds/14.png'
import groundTexture15 from '../../images/grounds/15.png'
export const colorOptions: MapPaletteColorOption[] = [
  { key: 'black', labelKey: 'pages.mapEdit.colors.black' },
  { key: 'red', labelKey: 'pages.mapEdit.colors.red' },
  { key: 'green', labelKey: 'pages.mapEdit.colors.green' },
  { key: 'blue', labelKey: 'pages.mapEdit.colors.blue' },
  { key: 'white', labelKey: 'pages.mapEdit.colors.white' },
  { key: 'gray', labelKey: 'pages.mapEdit.colors.gray' },
  { key: 'yellow', labelKey: 'pages.mapEdit.colors.yellow' },
  { key: 'orange', labelKey: 'pages.mapEdit.colors.orange' },
  { key: 'purple', labelKey: 'pages.mapEdit.colors.purple' },
  { key: 'brown', labelKey: 'pages.mapEdit.colors.brown' },
  { key: 'tortoise', labelKey: 'pages.mapEdit.colors.tortoise' },
  { key: 'pink', labelKey: 'pages.mapEdit.colors.pink' },
]

export const groundTextureOptions: MapGroundTextureOption[] = [
  { key: '1', imageSrc: groundTexture1 },
  { key: '2', imageSrc: groundTexture2 },
  { key: '3', imageSrc: groundTexture3 },
  { key: '4', imageSrc: groundTexture4 },
  { key: '5', imageSrc: groundTexture5 },
  { key: '6', imageSrc: groundTexture6 },
  { key: '7', imageSrc: groundTexture7 },
  { key: '8', imageSrc: groundTexture8 },
  { key: '9', imageSrc: groundTexture9 },
  { key: '10', imageSrc: groundTexture10 },
  { key: '11', imageSrc: groundTexture11 },
  { key: '12', imageSrc: groundTexture12 },
  { key: '13', imageSrc: groundTexture13 },
  { key: '14', imageSrc: groundTexture14 },
  { key: '15', imageSrc: groundTexture15 },
]

export const getMapGroundTextureSrc = (texture: MapGroundTexture): string => {
  return groundTextureOptions.find((option) => option.key === texture)?.imageSrc ?? groundTextureOptions[0]?.imageSrc ?? ''
}

export const elementAssetOptions: MapElementAssetOption[] = [
  { category: 'trees', variant: '1', imageSrc: treeElement1 },
  { category: 'trees', variant: '2', imageSrc: treeElement2 },
  { category: 'trees', variant: '3', imageSrc: treeElement3 },
  { category: 'trees', variant: '4', imageSrc: treeElement4 },
  { category: 'trees', variant: '5', imageSrc: treeElement5 },
  { category: 'trees', variant: '6', imageSrc: treeElement6 },
  { category: 'bushes', variant: '1', imageSrc: bushElement1 },
  { category: 'bushes', variant: '2', imageSrc: bushElement2 },
  { category: 'bushes', variant: '3', imageSrc: bushElement3 },
  { category: 'bushes', variant: '4', imageSrc: bushElement4 },
  { category: 'bushes', variant: '5', imageSrc: bushElement5 },
  { category: 'bushes', variant: '6', imageSrc: bushElement6 },
  { category: 'bushes', variant: '7', imageSrc: bushElement7 },
  { category: 'bushes', variant: '8', imageSrc: bushElement8 },
  { category: 'stairs', variant: '1', imageSrc: stairElement1 },
  { category: 'stairs', variant: '2', imageSrc: stairElement2 },
  { category: 'stairs', variant: '3', imageSrc: stairElement3 },
  { category: 'stairs', variant: '4', imageSrc: stairElement4 },
  { category: 'stairs', variant: '5', imageSrc: stairElement5 },
  { category: 'stairs', variant: '6', imageSrc: stairElement6 },
  { category: 'furnitures', variant: '1', imageSrc: furnitureElement1 },
  { category: 'furnitures', variant: '2', imageSrc: furnitureElement2 },
  { category: 'furnitures', variant: '3', imageSrc: furnitureElement3 },
  { category: 'furnitures', variant: '4', imageSrc: furnitureElement4 },
  { category: 'furnitures', variant: '5', imageSrc: furnitureElement5 },
  { category: 'furnitures', variant: '6', imageSrc: furnitureElement6 },
  { category: 'furnitures', variant: '7', imageSrc: furnitureElement7 },
  { category: 'furnitures', variant: '8', imageSrc: furnitureElement8 },
  { category: 'furnitures', variant: '9', imageSrc: furnitureElement9 },
  { category: 'furnitures', variant: '10', imageSrc: furnitureElement10 },
  { category: 'furnitures', variant: '11', imageSrc: furnitureElement11 },
  { category: 'stones', variant: '1', imageSrc: stoneElement1 },
  { category: 'stones', variant: '2', imageSrc: stoneElement2 },
  { category: 'stones', variant: '3', imageSrc: stoneElement3 },
  { category: 'stones', variant: '4', imageSrc: stoneElement4 },
  { category: 'stones', variant: '5', imageSrc: stoneElement5 },
  { category: 'stones', variant: '6', imageSrc: stoneElement6 },
  { category: 'stones', variant: '7', imageSrc: stoneElement7 },
  { category: 'stones', variant: '8', imageSrc: stoneElement8 },
  { category: 'stones', variant: '9', imageSrc: stoneElement9 },
  { category: 'monsters', variant: '1', imageSrc: monsterElement1 },
  { category: 'monsters', variant: '2', imageSrc: monsterElement2 },
  { category: 'monsters', variant: '3', imageSrc: monsterElement3 },
  { category: 'monsters', variant: '4', imageSrc: monsterElement4 },
  { category: 'monsters', variant: '5', imageSrc: monsterElement5 },
  { category: 'monsters', variant: '6', imageSrc: monsterElement6 },
  { category: 'monsters', variant: '7', imageSrc: monsterElement7 },
  { category: 'monsters', variant: '8', imageSrc: monsterElement8 },
  { category: 'monsters', variant: '9', imageSrc: monsterElement9 },
  { category: 'monsters', variant: '10', imageSrc: monsterElement10 },
  { category: 'monsters', variant: '11', imageSrc: monsterElement11 },
  { category: 'monsters', variant: '12', imageSrc: monsterElement12 },
  { category: 'monsters', variant: '13', imageSrc: monsterElement13 },
  { category: 'monsters', variant: '14', imageSrc: monsterElement14 },
  { category: 'monsters', variant: '15', imageSrc: monsterElement15 },
  { category: 'monsters', variant: '16', imageSrc: monsterElement16 },
  { category: 'monsters', variant: '17', imageSrc: monsterElement17 },
  { category: 'monsters', variant: '18', imageSrc: monsterElement18 },
  { category: 'monsters', variant: '19', imageSrc: monsterElement19 },
  { category: 'monsters', variant: '20', imageSrc: monsterElement20 },
  { category: 'monsters', variant: '21', imageSrc: monsterElement21 },
  { category: 'monsters', variant: '22', imageSrc: monsterElement22 },
  { category: 'monsters', variant: '23', imageSrc: monsterElement23 },
  { category: 'monsters', variant: '24', imageSrc: monsterElement24 },
  { category: 'monsters', variant: '25', imageSrc: monsterElement25 },
  { category: 'monsters', variant: '26', imageSrc: monsterElement26 },
  { category: 'monsters', variant: '27', imageSrc: monsterElement27 },
  { category: 'monsters', variant: '28', imageSrc: monsterElement28 },
  { category: 'monsters', variant: '29', imageSrc: monsterElement29 },
  { category: 'monsters', variant: '30', imageSrc: monsterElement30 },
  { category: 'misc', variant: '1', imageSrc: miscElement1 },
  { category: 'misc', variant: '2', imageSrc: miscElement2 },
  { category: 'misc', variant: '3', imageSrc: miscElement3 },
  { category: 'misc', variant: '4', imageSrc: miscElement4 },
  { category: 'misc', variant: '5', imageSrc: miscElement5 },
  { category: 'misc', variant: '6', imageSrc: miscElement6 },
  { category: 'misc', variant: '7', imageSrc: miscElement7 },
  { category: 'misc', variant: '8', imageSrc: miscElement8 },
  { category: 'misc', variant: '9', imageSrc: miscElement9 },
  { category: 'misc', variant: '10', imageSrc: miscElement10 },
  { category: 'misc', variant: '11', imageSrc: miscElement11 },
  { category: 'misc', variant: '12', imageSrc: miscElement12 },
  { category: 'misc', variant: '13', imageSrc: miscElement13 },
  { category: 'misc', variant: '14', imageSrc: miscElement14 },
  { category: 'misc', variant: '15', imageSrc: miscElement15 },
  { category: 'misc', variant: '16', imageSrc: miscElement16 },
  { category: 'misc', variant: '17', imageSrc: miscElement17 },
  { category: 'misc', variant: '18', imageSrc: miscElement18 },
  { category: 'misc', variant: '19', imageSrc: miscElement19 },
]

export const elementCategories: MapElementCategory[] = ['trees', 'bushes', 'stairs', 'furnitures', 'stones', 'monsters', 'misc']

export const getElementAssetSrc = (category: MapElementCategory, variant: MapElementVariant): string => {
  return elementAssetOptions.find((option) => option.category === category && option.variant === variant)?.imageSrc ?? elementAssetOptions.find((option) => option.category === category)?.imageSrc ?? ''
}

export const drawModeOptions: MapDrawModeOption[] = [
  { key: 'single', labelKey: 'pages.mapEdit.drawModes.single' },
  { key: 'range', labelKey: 'pages.mapEdit.drawModes.range' },
  { key: 'rectangle', labelKey: 'pages.mapEdit.drawModes.rectangle' },
]

export const layerOptions: MapLayerOption[] = [
  { key: 'lines', labelKey: 'pages.mapEdit.layers.lines' },
  { key: 'ground', labelKey: 'pages.mapEdit.layers.ground' },
  { key: 'elements', labelKey: 'pages.mapEdit.layers.elements' },
  { key: 'labels', labelKey: 'pages.mapEdit.layers.labels' },
]
