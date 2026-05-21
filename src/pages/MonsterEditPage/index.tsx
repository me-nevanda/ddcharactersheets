import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useMonsterEditPage } from './monsterEditPageHooks'
import { AttacksTab } from './tabs/AttacksTab'
import { LootTab } from './tabs/LootTab'
import type { MonsterEditTabKey } from './types'
import styles from './style.module.scss'

export const MonsterEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const { error, form, handleAttackAdd, handleAttackChange, handleAttackRemove, handleArmorBonusChange, handleChange, handleDescriptionChange, handleGenerateAttributes, handleImageChange, handleImageRemove, handleItemBonusFieldChange, handleItemChange, handleItemCreateEmpty, handleItemRemove, handlePrint, handleResistancesChange, handleSpecialChange, handleSubmit, handleWeaponDamageChange, hasChanges, imageUrl, loading, removingImage, saving, uploadingImage } = useMonsterEditPage()
  const [activeTab, setActiveTab] = useState<MonsterEditTabKey>('general')
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)
  const bloodiedValue = Math.floor(form.hp / 2)
  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }
    handleTabChange('monsters')
  }
  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('monsters')
    navigate('/')
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={`${styles.headerImagePicker} ${imageUrl ? styles.headerImagePickerWithImage : ''}`}>
              <input id="monster-image-input" className={styles.headerImageInput} type="file" accept="image/png,image/jpeg" onChange={(event) => void handleImageChange(event)} disabled={uploadingImage || removingImage} />
              {imageUrl ? (
                <>
                  <img className={styles.headerImage} src={imageUrl} alt={t('pages.monsterEdit.fields.image')} />
                  <div className={styles.headerImageActions}>
                    <label className={styles.headerImageAction} htmlFor="monster-image-input" aria-disabled={uploadingImage || removingImage}>
                      <AppIcon name="edit" />
                      <span>{t('pages.monsterEdit.imageActions.uploadNew')}</span>
                    </label>
                    <button className={`${styles.headerImageAction} ${styles.headerImageDangerAction}`} type="button" disabled={uploadingImage || removingImage} onClick={() => void handleImageRemove()}>
                      <AppIcon name="trash" />
                      <span>{t('pages.monsterEdit.imageActions.remove')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.headerImagePlaceholder} htmlFor="monster-image-input">
                  {t('pages.monsterEdit.placeholders.image')}
                </label>
              )}
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.monsterEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="name">
                <span className={styles.srOnly}>{t('pages.monsterEdit.fields.name')}</span>
                <input className={styles.titleInput} id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder={t('pages.monsterEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to="/" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.printAction}>
              <button className={styles.printPrimaryButton} type="button" onClick={handlePrint}>
                <span className={styles.buttonContent}>
                  <AppIcon name="print" />
                  <span>{t('common.actions.print')}</span>
                </span>
              </button>
            </div>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="monster-edit-form" type="submit" disabled={saving || !hasChanges}>
                <span className={styles.buttonContent}>
                  <AppIcon name="save" />
                  <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('pages.monsterEdit.loading')}</p>
        ) : (
          <form id="monster-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.editorBody}>
              <aside className={styles.tabRail} aria-label={t('pages.monsterEdit.title')}>
                <button className={`${styles.tabButton} ${activeTab === 'general' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('general')}>
                  {t('pages.monsterEdit.tabs.general')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'attacks' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('attacks')}>
                  {t('pages.monsterEdit.tabs.attacks')}
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'loot' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('loot')}>
                  {t('pages.monsterEdit.tabs.loot')}
                </button>
              </aside>

              <div className={styles.tabPanel}>
                {activeTab === 'general' ? <div className={styles.generalGrid}>
                  <div className={styles.leftColumn}>
                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.defenses')}</h2>
                      </div>

                      <div className={styles.defenseGrid}>
                        <label className={styles.defenseCard} htmlFor="kp">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.kp')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="kp" name="kp" type="number" min="0" max="50" value={form.defenses.kp} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="fortitude">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.fortitude')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="fortitude" name="fortitude" type="number" min="0" max="50" value={form.defenses.fortitude} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="reflex">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.reflex')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="reflex" name="reflex" type="number" min="0" max="50" value={form.defenses.reflex} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="will">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.will')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="will" name="will" type="number" min="0" max="50" value={form.defenses.will} onChange={handleChange} />
                        </label>
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.suggested')}</h2>
                      </div>

                      <div className={styles.suggestedGrid}>
                        <div className={styles.suggestedRow}>
                          <span className={styles.suggestedRowLabel}>{t('pages.monsterEdit.fields.attack')}</span>
                          <label className={styles.suggestedInlineField} htmlFor="attackVsKp">
                            <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.vsKp')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="attackVsKp" name="attackVsKp" type="text" value={form.suggested.attackVsKp} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="attackVsOtherDefenses">
                            <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.vsOtherDefenses')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="attackVsOtherDefenses" name="attackVsOtherDefenses" type="text" value={form.suggested.attackVsOtherDefenses} onChange={handleChange} />
                          </label>
                        </div>
                        <div className={styles.suggestedRow}>
                          <span className={styles.suggestedRowLabel}>{t('pages.monsterEdit.fields.damage')}</span>
                          <label className={styles.suggestedInlineField} htmlFor="lowDamage">
                            <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.low')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="lowDamage" name="lowDamage" type="text" value={form.suggested.lowDamage} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="mediumDamage">
                            <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.medium')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="mediumDamage" name="mediumDamage" type="text" value={form.suggested.mediumDamage} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="highDamage">
                            <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.high')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="highDamage" name="highDamage" type="text" value={form.suggested.highDamage} onChange={handleChange} />
                          </label>
                        </div>
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.statsGrid}>
                        <label className={`${styles.statCard} ${styles.levelTypeCard}`} htmlFor="level">
                          <span className={styles.srOnly}>{t('pages.monsterEdit.fields.level')}</span>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.statInput}`} id="level" name="level" value={form.level} onChange={handleChange}>
                            {Array.from({ length: 30 }, (_, levelIndex) => levelIndex + 1).map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.roleInput}`} id="role" name="role" value={form.role} onChange={handleChange} aria-label={t('pages.monsterEdit.fields.role')}>
                            <option value="skirmisher">{t('pages.monsterEdit.roleOptions.skirmisher')}</option>
                            <option value="brute">{t('pages.monsterEdit.roleOptions.brute')}</option>
                            <option value="soldier">{t('pages.monsterEdit.roleOptions.soldier')}</option>
                            <option value="lurker">{t('pages.monsterEdit.roleOptions.lurker')}</option>
                            <option value="controller">{t('pages.monsterEdit.roleOptions.controller')}</option>
                            <option value="artillery">{t('pages.monsterEdit.roleOptions.artillery')}</option>
                          </select>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.typeInput}`} id="type" name="type" value={form.type} onChange={handleChange}>
                            <option value="minion">{t('pages.monsterEdit.typeOptions.minion')}</option>
                            <option value="normal">{t('pages.monsterEdit.typeOptions.normal')}</option>
                            <option value="solo">{t('pages.monsterEdit.typeOptions.solo')}</option>
                            <option value="elite">{t('pages.monsterEdit.typeOptions.elite')}</option>
                          </select>
                          <button className={styles.generateAttributesButton} type="button" aria-label={t('pages.monsterEdit.actions.generateAttributes')} title={t('pages.monsterEdit.actions.generateAttributes')} onClick={handleGenerateAttributes}>
                            <AppIcon name="magic" />
                          </button>
                        </label>
                        <label className={styles.statCard} htmlFor="speed">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.speed')}</span>
                          <input className={`${styles.input} ${styles.statInput}`} id="speed" name="speed" type="number" min="0" max="999" value={form.speed} onChange={handleChange} />
                        </label>
                        <label className={styles.statCard} htmlFor="hp">
                          <span className={styles.defenseLabel}>{t('pages.monsterEdit.fields.hp')}</span>
                          <input className={`${styles.input} ${styles.statInput}`} id="hp" name="hp" type="number" min="0" max="999" value={form.hp} onChange={handleChange} />
                          <span className={styles.bloodiedValue}>
                            <span>{t('pages.monsterEdit.fields.bloodied')}</span>
                            <span className={styles.modifierBadge}>{bloodiedValue}</span>
                          </span>
                        </label>
                      </div>
                    </section>
                  </div>

                  <div className={styles.rightColumn}>
                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.resistances')}</h2>
                      </div>

                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.monsterEdit.sections.resistances')} minHeightClassName={styles.resistancesTextarea} name="resistances" placeholder={t('pages.monsterEdit.placeholders.resistances')} toolbar={false} value={form.resistances} onChange={handleResistancesChange} />
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.special')}</h2>
                      </div>

                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.monsterEdit.sections.special')} minHeightClassName={styles.resistancesTextarea} name="special" placeholder={t('pages.monsterEdit.placeholders.special')} toolbar={false} value={form.special} onChange={handleSpecialChange} />
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.monsterEdit.sections.description')}</h2>
                      </div>

                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.monsterEdit.fields.description')} minHeightClassName={styles.descriptionTextarea} name="description" placeholder={t('pages.monsterEdit.placeholders.description')} toolbar={false} value={form.description} onChange={handleDescriptionChange} />
                      </div>
                    </section>
                  </div>
                </div> : null}
                {activeTab === 'attacks' ? <AttacksTab attacks={form.attacks} onAttackAdd={handleAttackAdd} onAttackChange={handleAttackChange} onAttackRemove={handleAttackRemove} /> : null}
                {activeTab === 'loot' ? <LootTab items={form.items} onArmorBonusChange={handleArmorBonusChange} onItemBonusFieldChange={handleItemBonusFieldChange} onItemChange={handleItemChange} onItemCreateEmpty={handleItemCreateEmpty} onItemRemove={handleItemRemove} onWeaponDamageChange={handleWeaponDamageChange} /> : null}
              </div>
            </div>
          </form>
        )}
        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
