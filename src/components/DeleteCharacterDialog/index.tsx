import { useI18n } from '@i18n/index';
import type { DeleteCharacterDialogProps } from './types';
import styles from './style.module.scss';
export const DeleteCharacterDialog = ({ characterName, deleting, open, onCancel, onConfirm, }: DeleteCharacterDialogProps) => {
    const { t } = useI18n();
    if (!open) {
        return null;
    }
    return (<div className={styles.backdrop} role="presentation">
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-character-title">
        <h2 className={styles.title} id="delete-character-title">
          {t('pages.characterList.deleteDialog.title')}
        </h2>
        <p className={styles.text}>
          {t('pages.characterList.deleteDialog.body', {
            name: characterName,
        })}
        </p>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={deleting}>
            {t('common.actions.cancel')}
          </button>
          <button className={styles.dangerButton} type="button" onClick={onConfirm} disabled={deleting}>
            {deleting ? t('common.states.deleting') : t('common.actions.delete')}
          </button>
        </div>
      </div>
    </div>);
};
