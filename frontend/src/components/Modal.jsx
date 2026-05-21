import React, { useEffect } from 'react';

/**
 * Modal genérico reutilizável.
 * Props:
 *   open       — boolean
 *   onClose    — fn (chamado ao clicar no X ou overlay, se closeOnOverlay)
 *   title      — string
 *   size       — '' | 'sm' | 'lg'
 *   stackLevel — 0 (padrão) | 1 | 2   (controla z-index para modais empilhados)
 *   footer     — ReactNode (botões do rodapé)
 *   closeOnOverlay — boolean (default true)
 *   children
 */
export default function Modal({
  open,
  onClose,
  title,
  size = '',
  stackLevel = 0,
  footer,
  closeOnOverlay = true,
  children,
}) {
  // Bloqueia scroll do body enquanto modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const overlayClass = [
    'modal-overlay',
    stackLevel === 1 ? 'stacked' : '',
    stackLevel === 2 ? 'stacked-2' : '',
  ].filter(Boolean).join(' ');

  const modalClass = ['modal', size ? `modal-${size}` : ''].filter(Boolean).join(' ');

  return (
    <div
      className={overlayClass}
      onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) onClose?.(); } : undefined}
    >
      <div className={modalClass} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Fechar"
            style={{ fontSize: '1.25rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
