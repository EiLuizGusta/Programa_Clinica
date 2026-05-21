import React, { useState } from 'react';
import AssinaturaModal from './AssinaturaModal';
import { maskCPF, maskRG, maskCelular, maskTelefone, maskCEP, compressImage } from '../utils/masks';
import api from '../api';
import ROUTES from '../routes';

// ── Componente auxiliar (fora da função para evitar recriação) ───────────────

const FieldMemo = React.memo(function Field({ label, value, editKey, mask, editando, paciente, onChange }) {
  return (
    <div className="a4-field">
      <span className="a4-field-label">{label}</span>
      {editando ? (
        <input
          className="a4-field-input"
          value={value ?? ''}
          onChange={(e) => {
            const v = mask ? mask(e.target.value) : e.target.value;
            onChange?.({ ...paciente, [editKey]: v });
          }}
        />
      ) : (
        <span className="a4-field-value">{value || '—'}</span>
      )}
    </div>
  );
});

/**
 * Folha A4 — dados do paciente.
 * Props:
 *   paciente     — objeto paciente
 *   empresa      — objeto empresa (para logo)
 *   editando     — boolean
 *   onChange     — fn(updatedPaciente)  (chamado após salvar assinatura ou campo)
 */
function FolhaPaciente({ paciente, empresa, editando, onChange }) {
  const [modalAssinatura, setModalAssinatura] = useState(false);
  const [savingAssinatura, setSavingAssinatura] = useState(false);

  if (!paciente) return null;

  // Salva assinatura (substitui a anterior)
  const handleSalvarAssinatura = async (dataUrl) => {
    setSavingAssinatura(true);
    try {
      const compressed = await compressImage(dataUrl, 0.6, 900);
      const { data } = await api.patch(ROUTES.paciente(paciente.classificacao), {
        assinatura: compressed,
      });
      onChange?.(data);
      setModalAssinatura(false);
    } catch {
      alert('Erro ao salvar a assinatura.');
    } finally {
      setSavingAssinatura(false);
    }
  };

  return (
    <>
      <div className="a4-sheet">
        {/* Logo */}
        <div className="a4-logo">
          {empresa?.logo
            ? <img src={empresa.logo} alt="Logo" />
            : <span style={{ fontSize: '2.5rem' }}>🏥</span>}
        </div>

        <div className="a4-title">Ficha do Paciente</div>

        {/* Identificação */}
        <div className="a4-section">
          <div className="a4-section-title">Identificação</div>
          <div className="a4-grid">
            <FieldMemo label="Classificação" value={String(paciente.classificacao)} editKey="id" editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Nome" value={paciente.nome} editKey="nome" editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="CPF" value={paciente.cpf} editKey="cpf" mask={maskCPF} editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="RG" value={paciente.rg} editKey="rg" mask={maskRG} editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="E-mail" value={paciente.email} editKey="email" editando={editando} paciente={paciente} onChange={onChange} />
          </div>
        </div>

        {/* Contato */}
        <div className="a4-section">
          <div className="a4-section-title">Contato</div>
          <div className="a4-grid">
            <FieldMemo label="Celular" value={paciente.celular} editKey="celular" mask={maskCelular} editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Telefone" value={paciente.telefone} editKey="telefone" mask={maskTelefone} editando={editando} paciente={paciente} onChange={onChange} />
          </div>
        </div>

        {/* Endereço */}
        <div className="a4-section">
          <div className="a4-section-title">Endereço</div>
          <div className="a4-grid">
            <FieldMemo label="CEP" value={paciente.cep} editKey="cep" mask={maskCEP} editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Bairro" value={paciente.bairro} editKey="bairro" editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Endereço" value={paciente.endereco} editKey="endereco" editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Número" value={paciente.numero} editKey="numero" editando={editando} paciente={paciente} onChange={onChange} />
            <FieldMemo label="Complemento" value={paciente.complemento} editKey="complemento" editando={editando} paciente={paciente} onChange={onChange} />
          </div>
        </div>

        {/* Assinatura */}
        <div className="a4-section">
          <div className="a4-section-title">Assinatura do Paciente</div>
          <div
            className="assinatura-card"
            style={{ cursor: editando || !paciente.assinatura ? 'pointer' : 'default' }}
            onClick={() => {
              if (editando || !paciente.assinatura) setModalAssinatura(true);
            }}
            title={
              editando
                ? 'Clique para substituir a assinatura'
                : !paciente.assinatura
                ? 'Clique para assinar'
                : ''
            }
          >
            {savingAssinatura ? (
              <div style={{ padding: '1rem' }}>
                <span className="spinner" />
              </div>
            ) : paciente.assinatura ? (
              <img src={ROUTES.media(paciente.assinatura)} alt="Assinatura" />
            ) : (
              <div className="assinatura-placeholder">
                <div style={{ fontSize: '2rem' }}>✍️</div>
                <div>Toque aqui para assinar</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AssinaturaModal
        open={modalAssinatura}
        onClose={() => setModalAssinatura(false)}
        onSave={handleSalvarAssinatura}
      />
    </>
  );
}

export default React.memo(FolhaPaciente);
