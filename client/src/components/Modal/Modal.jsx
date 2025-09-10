import styles from './Modal.module.css';

const Modal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.confirmationOverlay} onClick={onCancel}>
      <div className={styles.confirmationContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmationHeader}>
          <div className={`${styles.confirmationIcon} ${styles[`confirmationIcon${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
            {type === 'danger' ? '⚠️' : type === 'info' ? 'ℹ️' : '❓'}
          </div>
          <h3>{title}</h3>
        </div>
        
        <div className={styles.confirmationBody}>
          <p>{message}</p>
        </div>
        
        <div className={styles.confirmationActions}>
          <button 
            onClick={onCancel} 
            className={styles.cancelButton}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`${styles.confirmButton} ${styles[`confirm${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                {confirmText}
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;