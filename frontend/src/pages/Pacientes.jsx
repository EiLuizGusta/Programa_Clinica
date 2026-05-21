import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ROUTES from '../routes';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FilterPanel from '../components/FilterPanel';
import {
  maskCPF, maskRG, maskCelular, maskTelefone, maskCEP,
} from '../utils/masks';
import adicionarIcon from '../icons/adicionar.png';
import pesquisarIcon from '../icons/pesquisar.png';
import filtroIcon from '../icons/filtro.png';
import cardIcon from '../icons/card.png';
import tabelaIcon from '../icons/tabela.jpg';
import fichaIcon from '../icons/ficha.png';

const FILTER_FIELDS = [
  { key: 'classificacao', label: 'Classificação' },
  { key: 'nome',     label: 'Nome' },
  { key: 'cpf',      label: 'CPF' },
  { key: 'rg',       label: 'RG' },
  { key: 'celular',  label: 'Celular' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'numero',   label: 'Número' },
];

const PAC_VAZIO = {
  id: null, classificacao: null, nome: '', cpf: '', rg: '', celular: '', telefone: '',
  email: '', cep: '', endereco: '', numero: '', bairro: '', complemento: '',
};

export default function Pacientes() {
  const navigate = useNavigate();

  // ── Lista ─────────────────────────────────────────────────────────────────
  const [pacientes, setPacientes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros]       = useState(new Set(FILTER_FIELDS.map(f => f.key)));
  const [viewMode, setViewMode]     = useState('table'); // 'table' ou 'card'

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]   = useState(false);
  const [pac, setPac]               = useState(PAC_VAZIO);
  const [saving, setSaving]         = useState(false);
  const [erro, setErro]             = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(ROUTES.pacientes());
      setPacientes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  const pacientesFiltrados = useMemo(() => {
    if (!busca.trim()) return pacientes;
    const q = busca.toLowerCase();
    return pacientes.filter((p) =>
      [...filtros].some((k) => String(p[k] ?? '').toLowerCase().includes(q))
    );
  }, [pacientes, busca, filtros]);

  // ── Abrir / fechar ────────────────────────────────────────────────────────
  const abrir = (p = PAC_VAZIO) => { setPac({ ...p }); setErro(''); setModalOpen(true); };
  const fechar = () => { setModalOpen(false); setConfirmDelete(false); };

  const field = (k, mask) => (e) => {
    const v = mask ? mask(e.target.value) : e.target.value;
    setPac((prev) => ({ ...prev, [k]: v }));
  };

  const salvar = async () => {
    if (!pac.nome.trim()) { setErro('Nome é obrigatório.'); return; }
    setSaving(true); setErro('');
    try {
      const payload = { ...pac };

      delete payload.id;
      delete payload.classificacao;
      if (pac.id) {
        await api.patch(ROUTES.paciente(pac.id), payload);
      } else {
        await api.post(ROUTES.pacientes(), payload);
      }
      fechar();
      await fetchPacientes();
    } catch {
      setErro('Erro ao salvar paciente.');
    } finally {
      setSaving(false);
    }
  };

  const excluir = async () => {
    setDeleting(true);
    try {
      await api.delete(ROUTES.paciente(pac.id));
      fechar();
      await fetchPacientes();
    } catch {
      setErro('Não foi possível excluir.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      {/* Cabeçalho da seção */}
      <div className="section-header">
        <div className="section-header-title">Pacientes</div>
        <div className="section-header-actions">
          <button className="btn-icon-image" onClick={() => abrir()}><img src={adicionarIcon} alt="Adicionar paciente" /></button>

          <div className="search-bar">
            <span className="search-icon">
              <img src={pesquisarIcon} alt="Pesquisar" />
            </span>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <button className="btn-icon-image" onClick={() => setFilterOpen(v => !v)}><img src={filtroIcon} alt="Filtros" /></button>
            {filterOpen && (
              <FilterPanel
                fields={FILTER_FIELDS}
                checked={filtros}
                onChange={setFiltros}
                onClose={() => setFilterOpen(false)}
              />
            )}
          </div>

          <button 
            className="btn-icon-image"
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          >
            <img
              src={viewMode === 'table' ? cardIcon : tabelaIcon}
              alt={viewMode === 'table' ? 'Visualizar cards' : 'Visualizar tabela'}
            />
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="content-area">
        <div className="content-padding">
          <div className="card">
            {viewMode === 'table' ? (
              // ── Visualização Tabela ──────────────────────────────────────
              <div className="table-wrapper">
                {loading ? (
                  <div className="loading-container">
                    <span className="spinner spinner-lg" />
                    <span>Carregando pacientes...</span>
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">Nenhum paciente encontrado</div>
                    <div className="empty-state-text">Adicione um paciente usando o botão acima.</div>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        {filtros.has('classificacao') && <th>Classificação</th>}
                        {filtros.has('nome')     && <th>Nome</th>}
                        {filtros.has('cpf')      && <th>CPF</th>}
                        {filtros.has('rg')       && <th>RG</th>}
                        {filtros.has('celular')  && <th>Celular</th>}
                        {filtros.has('telefone') && <th>Telefone</th>}
                        {filtros.has('endereco') && <th>Endereço</th>}
                        {filtros.has('numero')   && <th>Nº</th>}
                        <th style={{ width: 90 }}>Ficha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientesFiltrados.map((p) => (
                        <tr key={p.id}>
                          {filtros.has('classificacao') && <td>{p.classificacao}</td>}
                          {filtros.has('nome')     && <td>{p.nome}</td>}
                          {filtros.has('cpf')      && <td>{p.cpf}</td>}
                          {filtros.has('rg')       && <td>{p.rg}</td>}
                          {filtros.has('celular')  && <td>{p.celular}</td>}
                          {filtros.has('telefone') && <td>{p.telefone}</td>}
                          {filtros.has('endereco') && <td>{p.endereco}</td>}
                          {filtros.has('numero')   && <td>{p.numero}</td>}
                          <td>
                            <button
                              className="btn-icon-image"
                              onClick={() => navigate(`/ficha/${p.id}`)}
                            >
                              <img src={fichaIcon} alt="Ficha" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              // ── Visualização Card ────────────────────────────────────────
              <div className="card-grid-wrapper">
                {loading ? (
                  <div className="loading-container">
                    <span className="spinner spinner-lg" />
                    <span>Carregando pacientes...</span>
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">Nenhum paciente encontrado</div>
                    <div className="empty-state-text">Adicione um paciente usando o botão acima.</div>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {pacientesFiltrados.map((p) => (
                      <div key={p.id} className="patient-card">
                        <div className="patient-card-row">
                          <div className="patient-card-field">
                            <span className="patient-card-label">Classificação:</span>
                            <span className="patient-card-value patient-card-value-id">{p.classificacao}</span>
                          </div>
                          <div className="patient-card-field">
                            <span className="patient-card-label">Nome:</span>
                            <span className="patient-card-value patient-card-value-nome">{p.nome}</span>
                          </div>
                        </div>

                        <div className="patient-card-row">
                          <div className="patient-card-field">
                            <span className="patient-card-label">CPF:</span>
                            <span className="patient-card-value">{p.cpf}</span>
                          </div>
                          <div className="patient-card-field">
                            <span className="patient-card-label">RG:</span>
                            <span className="patient-card-value">{p.rg}</span>
                          </div>
                        </div>

                        <div className="patient-card-row">
                          <div className="patient-card-field">
                            <span className="patient-card-label">Celular:</span>
                            <span className="patient-card-value">{p.celular}</span>
                          </div>
                          <div className="patient-card-field">
                            <span className="patient-card-label">Telefone:</span>
                            <span className="patient-card-value">{p.telefone}</span>
                          </div>
                        </div>

                        <div className="patient-card-row">
                          <div className="patient-card-field">
                            <span className="patient-card-label">Endereço:</span>
                            <span className="patient-card-value patient-card-value-endereco">{p.endereco}</span>
                          </div>
                          <div className="patient-card-field">
                            <span className="patient-card-label">nº:</span>
                            <span className="patient-card-value patient-card-value-numero">{p.numero}</span>
                          </div>
                        </div>

                        <div className="patient-card-footer">
                            <button
                              className="btn-icon-image"
                              onClick={() => navigate(`/ficha/${p.id}`)}
                            >
                              <img src={fichaIcon} alt="Ficha" />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Modal Paciente ═══════════════════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={fechar}
        title={pac.classificacao ? `Paciente #${pac.classificacao}` : 'Novo Paciente'}
        size="lg"
        footer={
          <>
            {pac.classificacao && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmDelete(true)}
                style={{ marginRight: 'auto' }}
              >
                🗑️ Excluir
              </button>
            )}
            <button className="btn btn-secondary" onClick={fechar}>Cancelar</button>
            <button className="btn btn-success" onClick={salvar} disabled={saving}>
              {saving ? <span className="spinner" /> : '💾 Salvar'}
            </button>
          </>
        }
      >
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-row cols-2">
          <div className="form-group">
            <label className="form-label">Classificação</label>
            <input className="form-control" value={pac.classificacao ?? '—'} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-control" value={pac.nome} onChange={field('nome')} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input className="form-control" value={pac.cpf} onChange={field('cpf', maskCPF)} placeholder="000.000.000-00" maxLength={14} />
          </div>
          <div className="form-group">
            <label className="form-label">RG</label>
            <input className="form-control" value={pac.rg} onChange={field('rg', maskRG)} placeholder="00.000.000-0" maxLength={12} />
          </div>
          <div className="form-group">
            <label className="form-label">Celular</label>
            <input className="form-control" value={pac.celular} onChange={field('celular', maskCelular)} placeholder="(00) 00000-0000" maxLength={16} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-control" value={pac.telefone} onChange={field('telefone', maskTelefone)} placeholder="(00) 0000-0000" maxLength={15} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">E-mail</label>
            <input className="form-control" type="email" value={pac.email} onChange={field('email')} placeholder="email@exemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">CEP</label>
            <input className="form-control" value={pac.cep} onChange={field('cep', maskCEP)} placeholder="00000-000" maxLength={9} />
          </div>
          <div className="form-group">
            <label className="form-label">Bairro</label>
            <input className="form-control" value={pac.bairro} onChange={field('bairro')} placeholder="Bairro" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Endereço</label>
            <input className="form-control" value={pac.endereco} onChange={field('endereco')} placeholder="Rua, Avenida..." />
          </div>
          <div className="form-group">
            <label className="form-label">Número</label>
            <input className="form-control" value={pac.numero} onChange={field('numero')} placeholder="Nº" />
          </div>
          <div className="form-group">
            <label className="form-label">Complemento</label>
            <input className="form-control" value={pac.complemento} onChange={field('complemento')} placeholder="Apto, bloco..." />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={excluir}
        loading={deleting}
        message={`Excluir o paciente "${pac.nome}" e toda a ficha?`}
      />
    </>
  );
}
