import React from 'react';
import Modal from './Modal';

/**
 * Modal de confirmação simples.
 * Props:
 *   open       — boolean
 *   onClose    — fn
 *   onConfirm  — fn
 *   title      — string (default 'Confirmar')
 *   message    — string
 *   confirmLabel — string (default 'Excluir')
 *   stackLevel — 0 | 1 | 2
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  message = 'Esta ação não pode ser desfeita. Deseja continuar?',
  confirmLabel = 'Excluir',
  stackLevel = 1,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      stackLevel={stackLevel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '0.95rem' }}>{message}</p>
    </Modal>
  );
}
