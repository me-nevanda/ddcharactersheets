import styles from '../../style.module.scss';
import type { AbilityRemoveDialogProps } from './types';
export const AbilityRemoveDialog = ({ pendingRemoval, onCancel, onConfirm, t, }: AbilityRemoveDialogProps) => {
    if (!pendingRemoval) {
        return null;
    }
    return (<div className={styles.deleteBackdrop} role="presentation">
      <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-ability-title">
        <h2 className={styles.deleteDialogTitle} id="delete-ability-title">
          {t('pages.characterEdit.abilities.removeDialog.title')}
        </h2>
        <p className={styles.deleteDialogText}>
          {t('pages.characterEdit.abilities.removeDialog.body', {
            name: pendingRemoval.name,
        })}
        </p>

        <div className={styles.deleteDialogActions}>
          <button className={styles.deleteDialogSecondaryButton} type="button" onClick={onCancel}>
            {t('common.actions.cancel')}
          </button>
          <button className={styles.deleteDialogDangerButton} type="button" onClick={onConfirm}>
            {t('common.actions.delete')}
          </button>
        </div>
      </div>
    </div>);
};
