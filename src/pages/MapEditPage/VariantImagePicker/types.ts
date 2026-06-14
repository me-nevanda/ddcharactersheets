export interface VariantImagePickerOption<TCategory extends string = string, TVariant extends string = string> {
  category: TCategory
  variant: TVariant
  imageSrc: string
  label: string
}

export interface VariantImagePickerCategory<TCategory extends string = string, TVariant extends string = string> {
  key: TCategory
  label: string
  selectedVariant: TVariant
  options: VariantImagePickerOption<TCategory, TVariant>[]
}

export interface VariantImagePickerProps<TCategory extends string = string, TVariant extends string = string> {
  activeCategory: TCategory
  activeVariant: TVariant
  ariaLabel: string
  categories: VariantImagePickerCategory<TCategory, TVariant>[]
  onSelect: (category: TCategory, variant: TVariant) => void
}
