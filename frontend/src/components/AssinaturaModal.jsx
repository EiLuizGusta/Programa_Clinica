import React, { useRef, useEffect, useState } from 'react';
import { compressImage } from '../utils/masks';

/**
 * Modal de assinatura com canvas — funciona com mouse e touch.
 * Props:
 *   open      — boolean
 *   onClose   — fn
 *   onSave    — fn(dataUrl: string)
 */
export default function AssinaturaModal({ open, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastPos = useRef(null);

  // Reseta o canvas toda vez que abre
  useEffect(() => {
    if (open) {
      setHasStroke(false);
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Ajusta resolução para telas de alta densidade (retina)
        const dpr = window.devicePixelRatio || 1;
        if (!canvas._scaled) {
          canvas.width = canvas.offsetWidth * dpr;
          canvas.height = canvas.offsetHeight * dpr;
          canvas._scaled = true;
        }
      }, 50);
    } else {
      if (canvasRef.current) canvasRef.current._scaled = false;
    }
  }, [open]);

  // Bloqueia scroll durante toque no canvas
  useEffect(() => {
    if (!open) return;
    const prevent = (e) => e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      if (canvas) canvas.removeEventListener('touchmove', prevent);
    };
  }, [open]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calcula a proporção entre o tamanho visual e o tamanho interno do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      const t = e.touches[0];
      return { 
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY
      };
    }
    return { 
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    setDrawing(true);
    lastPos.current = getPos(e);
    setHasStroke(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setDrawing(false);

  const limpar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const salvar = async () => {
    if (!hasStroke) return;
    setSaving(true);
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const compressed = await compressImage(dataUrl, 0.65, 900);
    onSave(compressed);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="assinatura-modal-overlay">
      <div className="assinatura-canvas-wrapper">
        <div className="assinatura-canvas-header">✍️ Assinatura do Paciente</div>

        <canvas
          ref={canvasRef}
          className="assinatura-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        <div className="assinatura-canvas-actions">
          <button className="btn btn-secondary btn-sm" onClick={limpar}>
            🗑️ Limpar
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={salvar}
              disabled={!hasStroke || saving}
            >
              {saving ? <span className="spinner" /> : '💾 Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
