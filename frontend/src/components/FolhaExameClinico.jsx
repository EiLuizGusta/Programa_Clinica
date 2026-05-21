import React, { useRef } from 'react';
import { useDetectImagePosition } from '../hooks/useDetectImagePosition';
import ROUTES from '../routes';
import DentesExameClinico from './DentesExameClinico';

// ── Componentes auxiliares (fora da função para evitar recriação) ────────────

const CampoNumericoMemo = React.memo(function CampoNumerico({ label, campo, mascara, placeholder, valor, editando, onChange }) {
  const set = (field, value) => onChange?.(field, value);

  return (
    <div className="a4-field" style={{ marginBottom: '0.75rem' }}>
      <span className="a4-field-label">{label}</span>
      {editando ? (
        <input
          className="form-control"
          type="text"
          value={valor ?? ''}
          onChange={(e) => set(campo, e.target.value)}
          placeholder={placeholder}
          style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}
        />
      ) : (
        <span className="a4-field-value">
          {valor ? `${valor} ${mascara}` : '—'}
        </span>
      )}
    </div>
  );
});

const TextoLivreMemo = React.memo(function TextoLivre({ label, campo, linhas = 3, valor, editando, onChange }) {
  const set = (field, value) => onChange?.(field, value);

  return (
    <div className="a4-field" style={{ marginBottom: '0.75rem' }}>
      <span className="a4-field-label">{label}</span>
      {editando ? (
        <textarea
          className="form-control"
          value={valor ?? ''}
          onChange={(e) => set(campo, e.target.value)}
          rows={linhas}
          style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}
        />
      ) : (
        <span className="a4-field-value" style={{ whiteSpace: 'pre-wrap' }}>
          {valor || '—'}
        </span>
      )}
    </div>
  );
});

function FolhaExameClinico({ exameClinico, editando, onChange, dentesEditando = {}, dentesPosExameEditando = {}, onChangeDentes, onChangeDentesPosExame, onDeleteDente, onDeleteDentePosExame }) {
  if (!exameClinico) return null;

  const set = (field, value) => onChange?.(field, value);
  const imgRef = useRef(null);
  const { detectPosition } = useDetectImagePosition();

  // Posições dos dentes (18 a 11)
  const dentes = [

  ];

  const handleImageClick = (e) => {
    detectPosition(e);
  };

  const handleDenteClick = (numeroDente) => {
    console.log(`🦷 Dente ${numeroDente}`);
  };

  return (
    <div className="a4-sheet">
      <div className="a4-title">Exame Clínico</div>

      {/* Identificação */}
      <div className="a4-section">
        <div className="a4-section-title">Identificação</div>
        <div className="a4-grid">
          <div className="a4-field">
            <span className="a4-field-label">ID do Exame</span>
            <span className="a4-field-value">{exameClinico.id}</span>
          </div>
          <div className="a4-field">
            <span className="a4-field-label">Data do Exame</span>
            <span className="a4-field-value">{exameClinico.data_exame}</span>
          </div>
        </div>
      </div>

      {/* Medidas Físicas */}
      <div className="a4-section">
        <div className="a4-section-title">Medidas Físicas</div>

        <div className="a4-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <CampoNumericoMemo
            label="Peso"
            campo="peso"
            mascara="kg"
            placeholder="Ex: 75.5"
            valor={exameClinico.peso}
            editando={editando}
            onChange={set}
          />
          <CampoNumericoMemo
            label="Altura"
            campo="altura"
            mascara="m"
            placeholder="Ex: 1.75"
            valor={exameClinico.altura}
            editando={editando}
            onChange={set}
          />
          <CampoNumericoMemo
            label="Pulso"
            campo="pulso"
            mascara="bpm"
            placeholder="Ex: 72"
            valor={exameClinico.pulso}
            editando={editando}
            onChange={set}
          />
          <CampoNumericoMemo
            label="Frequência Cardíaca"
            campo="frequencia_cardiaca"
            mascara="bpm"
            placeholder="Ex: 70"
            valor={exameClinico.frequencia_cardiaca}
            editando={editando}
            onChange={set}
          />
        </div>
      </div>

      {/* Estado Geral */}
      <div className="a4-section">
        <div className="a4-section-title">Estado Geral</div>
        <TextoLivreMemo
          label="Observações do Estado Geral"
          campo="estado_geral"
          linhas={5}
          valor={exameClinico.estado_geral}
          editando={editando}
          onChange={set}
        />
      </div>

      {/* Diagrama de Dentes — Exame Clínico */}
      <div className="a4-section">
        <div className="a4-section-title">Diagrama Odontológico</div>
        <DentesExameClinico
          exameClinicoId={exameClinico.id}
          editando={editando}
          onChange={onChangeDentes}
          onDelete={onDeleteDente}
          endpoint={ROUTES.dentesExameClinicoPorExame}
          titulo="Antes do Exame"
          tipo="antes"
        />

        <DentesExameClinico
          exameClinicoId={exameClinico.id}
          editando={editando}
          onChange={onChangeDentesPosExame}
          onDelete={onDeleteDentePosExame}
          endpoint={ROUTES.dentesExameClinicoPosExamePorExame}
          titulo="Após o Exame"
          tipo="pos"
        />
      </div>
    </div>
  );
}

export default React.memo(FolhaExameClinico);
