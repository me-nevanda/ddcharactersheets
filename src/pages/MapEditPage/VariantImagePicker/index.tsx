import { useState } from 'react'
import type { VariantImagePickerProps } from './types'
import styles from './style.module.scss'

export const VariantImagePicker = <TCategory extends string, TVariant extends string,>({
  activeCategory,
  activeVariant,
  ariaLabel,
  categories,
  onSelect,
}: VariantImagePickerProps<TCategory, TVariant>) => {
  const [openCategory, setOpenCategory] = useState<TCategory | null>(null)

  return (
    <div className={styles.palette} role="toolbar" aria-label={ariaLabel}>
      {categories.map((category) => {
        const selectedOption = category.options.find((option) => option.variant === category.selectedVariant) ?? category.options[0]

        return (
          <div key={category.key} className={styles.picker}>
            <button className={`${styles.assetButton} ${activeCategory === category.key ? styles.assetButtonActive : ''}`} type="button" aria-label={category.label} title={category.label} aria-pressed={activeCategory === category.key} onClick={() => {
              if (selectedOption) {
                onSelect(category.key, selectedOption.variant)
              }
            }} onDoubleClick={() => setOpenCategory(openCategory === category.key ? null : category.key)}>
              {selectedOption ? <img className={styles.assetImage} src={selectedOption.imageSrc} alt="" aria-hidden="true" /> : null}
            </button>
            {openCategory === category.key ? (
              <div className={styles.variantPopover}>
                {category.options.map((option) => (
                  <button key={`${option.category}-${option.variant}`} className={`${styles.variantButton} ${activeCategory === option.category && activeVariant === option.variant ? styles.variantButtonActive : ''}`} type="button" aria-label={option.label} title={option.label} aria-pressed={activeCategory === option.category && activeVariant === option.variant} onClick={() => {
                    onSelect(option.category, option.variant)
                    setOpenCategory(null)
                  }}>
                    <img className={styles.assetImage} src={option.imageSrc} alt="" aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
