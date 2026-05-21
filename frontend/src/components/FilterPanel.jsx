import React, { useRef, useEffect } from 'react';

/**
 * Painel de filtro com checkboxes.
 * Props:
 *   fields   — Array<{ key: string, label: string }>
 *   checked  — Set<string>
 *   onChange — fn(newSet: Set<string>)
 *   onClose  — fn
 */
export default function FilterPanel({ fields, checked, onChange, onClose }) {
  const ref = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const toggle = (key) => {
    const next = new Set(checked);
    if (next.has(key)) {
      if (next.size === 1) return; // pelo menos 1 sempre marcado
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  return (
    <div className="filter-panel" ref={ref}>
      <p className="text-small text-muted" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
        Filtrar por campo:
      </p>
      {fields.map((f) => (
        <label key={f.key} className="form-check" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            className="form-check-input"
            checked={checked.has(f.key)}
            onChange={() => toggle(f.key)}
          />
          <span className="form-check-label">{f.label}</span>
        </label>
      ))}
    </div>
  );
}
