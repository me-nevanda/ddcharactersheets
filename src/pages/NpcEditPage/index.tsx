import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useNpcEditPage } from './npcEditPageHooks'
import { AttacksTab } from './tabs/AttacksTab'
import { LootTab } from './tabs/LootTab'
import type { NpcEditTabKey } from './types'
import styles from './style.module.scss'

export const NpcEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const { error, form, handleAttackAdd, handleAttackChange, handleAttackRemove, handleArmorBonusChange, handleCancelGenerateAttributes, handleChange, handleConfirmGenerateAttributes, handleDescriptionChange, handleGenerateAttributes, handleImageChange, handleImageRemove, handleIsDeadToggle, handleIsStoryToggle, handleItemBonusFieldChange, handleItemChange, handleItemCreateEmpty, handleItemRemove, handlePrint, handleResistancesChange, handleSpecialChange, handleSubmit, handleWeaponDamageChange, hasChanges, imageUrl, isGenerateAttributesDialogOpen, loading, removingImage, saving, uploadingImage } = useNpcEditPage()
  const [activeTab, setActiveTab] = useState<NpcEditTabKey>('general')
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)
  const bloodiedValue = Math.floor(form.hp / 2)
  useEffect(() => {
    if (form.isStory && activeTab === 'attacks') {
      setActiveTab('general')
    }
  }, [form.isStory, activeTab])
  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }
    handleTabChange('npcs')
  }
  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('npcs')
    navigate('/')
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={`${styles.headerImagePicker} ${imageUrl ? styles.headerImagePickerWithImage : ''}`}>
              <input id="npc-image-input" className={styles.headerImageInput} type="file" accept="image/png,image/jpeg" onChange={(event) => void handleImageChange(event)} disabled={uploadingImage || removingImage} />
              {imageUrl ? (
                <>
                  <img className={styles.headerImage} src={imageUrl} alt={t('pages.npcEdit.fields.image')} />
                  <div className={styles.headerImageActions}>
                    <label className={styles.headerImageAction} htmlFor="npc-image-input" aria-disabled={uploadingImage || removingImage}>
                      <AppIcon name="edit" />
                      <span>{t('pages.npcEdit.imageActions.uploadNew')}</span>
                    </label>
                    <button className={`${styles.headerImageAction} ${styles.headerImageDangerAction}`} type="button" disabled={uploadingImage || removingImage} onClick={() => void handleImageRemove()}>
                      <AppIcon name="trash" />
                      <span>{t('pages.npcEdit.imageActions.remove')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.headerImagePlaceholder} htmlFor="npc-image-input">
                  {t('pages.npcEdit.placeholders.image')}
                </label>
              )}
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.npcEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="name">
                <span className={styles.srOnly}>{t('pages.npcEdit.fields.name')}</span>
                <input className={styles.titleInput} id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder={t('pages.npcEdit.placeholders.titleName')} autoComplete="off" />
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
              <button className={styles.primaryButton} form="npc-edit-form" type="submit" disabled={saving || !hasChanges}>
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
          <p className={styles.loadingText}>{t('pages.npcEdit.loading')}</p>
        ) : (
          <form id="npc-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.editorBody}>
              <aside className={styles.tabRail} aria-label={t('pages.npcEdit.title')}>
                <button className={`${styles.tabButton} ${activeTab === 'general' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('general')}>
                  {t('pages.npcEdit.tabs.general')}
                </button>
                {!form.isStory ? (
                  <button className={`${styles.tabButton} ${activeTab === 'attacks' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('attacks')}>
                    {t('pages.npcEdit.tabs.attacks')}
                  </button>
                ) : null}
                <button className={`${styles.tabButton} ${activeTab === 'loot' ? styles.tabButtonActive : ''}`} type="button" onClick={() => setActiveTab('loot')}>
                  {t('pages.npcEdit.tabs.loot')}
                </button>
              </aside>

              <div className={styles.tabPanel}>
                {activeTab === 'general' ? <div className={`${styles.generalGrid} ${form.isStory ? styles.generalGridStory : ''}`}>
                  {!form.isStory ? <div className={styles.leftColumn}>
                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.defenses')}</h2>
                      </div>

                      <div className={styles.defenseGrid}>
                        <label className={styles.defenseCard} htmlFor="kp">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.kp')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="kp" name="kp" type="number" min="0" max="50" value={form.defenses.kp} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="fortitude">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.fortitude')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="fortitude" name="fortitude" type="number" min="0" max="50" value={form.defenses.fortitude} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="reflex">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.reflex')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="reflex" name="reflex" type="number" min="0" max="50" value={form.defenses.reflex} onChange={handleChange} />
                        </label>
                        <label className={styles.defenseCard} htmlFor="will">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.will')}</span>
                          <input className={`${styles.input} ${styles.defenseInput}`} id="will" name="will" type="number" min="0" max="50" value={form.defenses.will} onChange={handleChange} />
                        </label>
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.statsGrid}>
                        <label className={`${styles.statCard} ${styles.levelTypeCard}`} htmlFor="level">
                          <span className={styles.srOnly}>{t('pages.npcEdit.fields.level')}</span>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.statInput}`} id="level" name="level" value={form.level} onChange={handleChange}>
                            {Array.from({ length: 30 }, (_, levelIndex) => levelIndex + 1).map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.roleInput}`} id="role" name="role" value={form.role} onChange={handleChange} aria-label={t('pages.npcEdit.fields.role')}>
                            <option value="skirmisher">{t('pages.npcEdit.roleOptions.skirmisher')}</option>
                            <option value="brute">{t('pages.npcEdit.roleOptions.brute')}</option>
                            <option value="soldier">{t('pages.npcEdit.roleOptions.soldier')}</option>
                            <option value="lurker">{t('pages.npcEdit.roleOptions.lurker')}</option>
                            <option value="controller">{t('pages.npcEdit.roleOptions.controller')}</option>
                            <option value="artillery">{t('pages.npcEdit.roleOptions.artillery')}</option>
                          </select>
                          <select className={`${styles.input} ${styles.selectChevronInset} ${styles.typeInput}`} id="type" name="type" value={form.type} onChange={handleChange}>
                            <option value="minion">{t('pages.npcEdit.typeOptions.minion')}</option>
                            <option value="normal">{t('pages.npcEdit.typeOptions.normal')}</option>
                            <option value="solo">{t('pages.npcEdit.typeOptions.solo')}</option>
                            <option value="elite">{t('pages.npcEdit.typeOptions.elite')}</option>
                          </select>
                          <button className={styles.generateAttributesButton} type="button" aria-label={t('pages.npcEdit.actions.generateAttributes')} title={t('pages.npcEdit.actions.generateAttributes')} onClick={handleGenerateAttributes}>
                            <AppIcon name="magic" />
                          </button>
                        </label>
                        <label className={styles.statCard} htmlFor="speed">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.speed')}</span>
                          <input className={`${styles.input} ${styles.statInput}`} id="speed" name="speed" type="number" min="0" max="999" value={form.speed} onChange={handleChange} />
                        </label>
                        <label className={styles.statCard} htmlFor="hp">
                          <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.hp')}</span>
                          <input className={`${styles.input} ${styles.statInput}`} id="hp" name="hp" type="number" min="0" max="9999" value={form.hp} onChange={handleChange} />
                          <span className={styles.bloodiedValue}>
                            <span>{t('pages.npcEdit.fields.bloodied')}</span>
                            <span className={styles.modifierBadge}>{bloodiedValue}</span>
                          </span>
                        </label>
                      </div>
                    </section>

                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.suggested')}</h2>
                      </div>

                      <div className={styles.suggestedGrid}>
                        <div className={styles.suggestedRow}>
                          <span className={styles.suggestedRowLabel}>{t('pages.npcEdit.fields.attack')}</span>
                          <label className={styles.suggestedInlineField} htmlFor="attackVsKp">
                            <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.vsKp')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="attackVsKp" name="attackVsKp" type="text" value={form.suggested.attackVsKp} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="attackVsOtherDefenses">
                            <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.vsOtherDefenses')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="attackVsOtherDefenses" name="attackVsOtherDefenses" type="text" value={form.suggested.attackVsOtherDefenses} onChange={handleChange} />
                          </label>
                        </div>
                        <div className={styles.suggestedRow}>
                          <span className={styles.suggestedRowLabel}>{t('pages.npcEdit.fields.damage')}</span>
                          <label className={styles.suggestedInlineField} htmlFor="lowDamage">
                            <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.low')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="lowDamage" name="lowDamage" type="text" value={form.suggested.lowDamage} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="mediumDamage">
                            <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.medium')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="mediumDamage" name="mediumDamage" type="text" value={form.suggested.mediumDamage} onChange={handleChange} />
                          </label>
                          <label className={styles.suggestedInlineField} htmlFor="highDamage">
                            <span className={styles.defenseLabel}>{t('pages.npcEdit.fields.high')}</span>
                            <input className={`${styles.input} ${styles.suggestedInput}`} id="highDamage" name="highDamage" type="text" value={form.suggested.highDamage} onChange={handleChange} />
                          </label>
                        </div>
                      </div>
                    </section>
                  </div> : null}

                  <div className={styles.rightColumn}>
                    <div className={styles.storyToggleGroup}>
                      <label className={styles.storyToggleRow} htmlFor="isStory">
                        <input className={styles.storyToggleInput} id="isStory" name="isStory" type="checkbox" checked={form.isStory} onChange={handleIsStoryToggle} />
                        <span className={styles.storyToggleLabel}>{t('pages.npcEdit.fields.isStory')}</span>
                      </label>
                      <label className={styles.storyToggleRow} htmlFor="isDead">
                        <input className={styles.storyToggleInput} id="isDead" name="isDead" type="checkbox" checked={form.isDead} onChange={handleIsDeadToggle} />
                        <span className={styles.storyToggleLabel}>{t('pages.npcEdit.fields.isDead')}</span>
                      </label>
                    </div>

                    {!form.isStory ? (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.resistances')}</h2>
                        </div>

                        <div className={styles.descriptionField}>
                          <SimpleWysiwygEditor ariaLabel={t('pages.npcEdit.sections.resistances')} minHeightClassName={styles.resistancesTextarea} name="resistances" placeholder={t('pages.npcEdit.placeholders.resistances')} toolbar={false} value={form.resistances} onChange={handleResistancesChange} />
                        </div>
                      </section>
                    ) : null}

                    {!form.isStory ? (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.special')}</h2>
                        </div>

                        <div className={styles.descriptionField}>
                          <SimpleWysiwygEditor ariaLabel={t('pages.npcEdit.sections.special')} minHeightClassName={styles.resistancesTextarea} name="special" placeholder={t('pages.npcEdit.placeholders.special')} toolbar={false} value={form.special} onChange={handleSpecialChange} />
                        </div>
                      </section>
                    ) : null}

                    <section className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('pages.npcEdit.sections.description')}</h2>
                      </div>

                      <div className={styles.descriptionField}>
                        <SimpleWysiwygEditor ariaLabel={t('pages.npcEdit.fields.description')} minHeightClassName={styles.descriptionTextarea} name="description" placeholder={t('pages.npcEdit.placeholders.description')} toolbar={false} value={form.description} onChange={handleDescriptionChange} />
                      </div>
                    </section>
                  </div>
                </div> : null}
                {activeTab === 'attacks' && !form.isStory ? <AttacksTab attacks={form.attacks} suggested={form.suggested} onAttackAdd={handleAttackAdd} onAttackChange={handleAttackChange} onAttackRemove={handleAttackRemove} /> : null}
                {activeTab === 'loot' ? <LootTab items={form.items} onArmorBonusChange={handleArmorBonusChange} onItemBonusFieldChange={handleItemBonusFieldChange} onItemChange={handleItemChange} onItemCreateEmpty={handleItemCreateEmpty} onItemRemove={handleItemRemove} onWeaponDamageChange={handleWeaponDamageChange} /> : null}
              </div>
            </div>
          </form>
        )}
        {isGenerateAttributesDialogOpen ? (
          <div className={styles.deleteBackdrop} role="presentation">
            <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="generate-attributes-title">
              <h2 className={styles.deleteDialogTitle} id="generate-attributes-title">
                {t('pages.npcEdit.generateAttributesDialog.title')}
              </h2>
              <p className={styles.deleteDialogText}>
                {t('pages.npcEdit.generateAttributesDialog.body')}
              </p>
              <div className={styles.deleteDialogActions}>
                <button className={styles.deleteDialogSecondaryButton} type="button" onClick={handleCancelGenerateAttributes}>
                  {t('common.actions.cancel')}
                </button>
                <button className={styles.deleteDialogDangerButton} type="button" onClick={handleConfirmGenerateAttributes}>
                  {t('pages.npcEdit.generateAttributesDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
