import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ title = 'Are you sure?', message, onConfirm, onCancel, confirmLabel = 'Delete' }) => {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
