import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ROUTES from '../routes';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FilterPanel from '../components/FilterPanel';
import { maskCNPJ } from '../utils/masks';

// Instância sem o interceptor de 401→/login, pois esta tela é pública
const api = axios.create({ headers: { 'Content-Type': 'application/json' } });

// ─── Campos filtráveis da tabela de empresas ──────────────────────────────────
const FILTER_FIELDS = [
  { key: 'id',            label: 'ID' },
  { key: 'razao_social',  label: 'Razão Social' },
  { key: 'nome_fantasia', label: 'Nome Fantasia' },
  { key: 'cnpj',         label: 'CNPJ' },
];

// ─── Empresa vazia ────────────────────────────────────────────────────────────
const EMPRESA_VAZIA = { id: null, razao_social: '', nome_fantasia: '', cnpj: '', logo: null };
const LOGIN_VAZIO   = { id: null, login: '', senha: '', empresa: null };

export default function GerenciarCadastros() {
  const navigate = useNavigate();
  useEffect(() => {
    const autorizado = localStorage.getItem('auth_admin');
    if (autorizado !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  // ── Estado da lista ───────────────────────────────────────────────────────
  const [empresas, setEmpresas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros]     = useState(new Set(FILTER_FIELDS.map(f => f.key)));

  // ── Estado modal empresa ──────────────────────────────────────────────────
  const [modalEmpresa, setModalEmpresa]   = useState(false);
  const [empresa, setEmpresa]             = useState(EMPRESA_VAZIA);
  const [logins, setLogins]               = useState([]);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [erroEmpresa, setErroEmpresa]     = useState('');
  const [confirmDeleteEmpresa, setConfirmDeleteEmpresa] = useState(false);
  const [deletingEmpresa, setDeletingEmpresa]           = useState(false);

  // ── Estado modal login ────────────────────────────────────────────────────
  const [modalLogin, setModalLogin]   = useState(false);
  const [loginForm, setLoginForm]     = useState(LOGIN_VAZIO);
  const [savingLogin, setSavingLogin] = useState(false);
  const [erroLogin, setErroLogin]     = useState('');
  const [confirmDeleteLogin, setConfirmDeleteLogin] = useState(false);
  const [deletingLogin, setDeletingLogin]           = useState(false);

  // ── Carregar empresas ─────────────────────────────────────────────────────
  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(ROUTES.empresas());
      setEmpresas(data);
    } catch {
      /* silencia — o interceptor já redireciona se 401 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

  // ── Carregar logins da empresa selecionada ────────────────────────────────
  const fetchLogins = useCallback(async (empresaId) => {
    if (!empresaId) { setLogins([]); return; }
    try {
      const { data } = await api.get(ROUTES.empresaLoginsPorEmpresa(empresaId));
      setLogins(data);
    } catch { setLogins([]); }
  }, []);

  // ── Pesquisa em tempo real ────────────────────────────────────────────────
  const empresasFiltradas = useMemo(() => {
    if (!busca.trim()) return empresas;
    const q = busca.toLowerCase();
    return empresas.filter((e) =>
      [...filtros].some((campo) => {
        const val = String(e[campo] ?? '').toLowerCase();
        return val.includes(q);
      })
    );
  }, [empresas, busca, filtros]);

  // ─────────────────────────────────────────────────────────────────────────
  // ── Empresa: abrir modal ──────────────────────────────────────────────────
  const abrirNovaEmpresa = () => {
    setEmpresa(EMPRESA_VAZIA);
    setLogins([]);
    setErroEmpresa('');
    setModalEmpresa(true);
  };

  const abrirEditarEmpresa = async (emp) => {
    setEmpresa({ ...emp });
    setErroEmpresa('');
    setModalEmpresa(true);
    await fetchLogins(emp.id);
  };

  const fecharModalEmpresa = () => {
    setModalEmpresa(false);
    setConfirmDeleteEmpresa(false);
  };

  // ── Empresa: salvar (cria ou atualiza) ────────────────────────────────────
  const salvarEmpresa = async () => {
    if (!empresa.razao_social.trim() || !empresa.nome_fantasia.trim()) {
      setErroEmpresa('Razão Social e Nome Fantasia são obrigatórios.');
      return;
    }
    setSavingEmpresa(true);
    setErroEmpresa('');
    try {
      const payload = {
        razao_social:  empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        cnpj:          empresa.cnpj,
      };
      let saved;
      if (empresa.id) {
        const { data } = await api.patch(ROUTES.empresa(empresa.id), payload);
        saved = data;
      } else {
        const { data } = await api.post(ROUTES.empresas(), payload);
        saved = data;
      }
      setEmpresa(saved);
      await fetchEmpresas();
      return saved; // usado por salvarEmpresaSeNecessario
    } catch (err) {
      setErroEmpresa('Erro ao salvar. Verifique os dados e tente novamente.');
      throw err;
    } finally {
      setSavingEmpresa(false);
    }
  };

  /** Garante que a empresa esteja salva antes de adicionar login */
  const salvarEmpresaSeNecessario = async () => {
    if (!empresa.id) {
      return await salvarEmpresa();
    }
    return empresa;
  };

  // ── Empresa: excluir ─────────────────────────────────────────────────────
  const excluirEmpresa = async () => {
    setDeletingEmpresa(true);
    try {
      await api.delete(ROUTES.empresa(empresa.id));
      fecharModalEmpresa();
      await fetchEmpresas();
    } catch {
      setErroEmpresa('Não foi possível excluir a empresa.');
    } finally {
      setDeletingEmpresa(false);
      setConfirmDeleteEmpresa(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ── Login: abrir modal ────────────────────────────────────────────────────
  const abrirNovoLogin = async () => {
    let emp = empresa;
    try { emp = await salvarEmpresaSeNecessario(); } catch { return; }
    setLoginForm({ ...LOGIN_VAZIO, empresa: emp.id });
    setErroLogin('');
    setModalLogin(true);
  };

  const abrirEditarLogin = (l) => {
    setLoginForm({ ...l });
    setErroLogin('');
    setModalLogin(true);
  };

  const fecharModalLogin = () => {
    setModalLogin(false);
    setConfirmDeleteLogin(false);
  };

  // ── Login: salvar ─────────────────────────────────────────────────────────
  const salvarLogin = async () => {
    if (!loginForm.login.trim() || !loginForm.senha.trim()) {
      setErroLogin('Login e senha são obrigatórios.');
      return;
    }
    setSavingLogin(true);
    setErroLogin('');
    try {
      const payload = { login: loginForm.login, senha: loginForm.senha, empresa: loginForm.empresa };
      if (loginForm.id) {
        await api.patch(ROUTES.empresaLogin(loginForm.id), payload);
      } else {
        await api.post(ROUTES.empresaLogins(), payload);
      }
      fecharModalLogin();
      await fetchLogins(loginForm.empresa);
    } catch {
      setErroLogin('Erro ao salvar login.');
    } finally {
      setSavingLogin(false);
    }
  };

  // ── Login: excluir ────────────────────────────────────────────────────────
  const excluirLogin = async () => {
    setDeletingLogin(true);
    try {
      await api.delete(ROUTES.empresaLogin(loginForm.id));
      fecharModalLogin();
      await fetchLogins(loginForm.empresa);
    } catch {
      setErroLogin('Não foi possível excluir o login.');
    } finally {
      setDeletingLogin(false);
      setConfirmDeleteLogin(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Cabeçalho */}
      <div className="app-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
          ← Voltar
        </button>
        <h2 style={{ flex: 1, fontSize: '1rem' }}>Gerenciar Cadastros</h2>
      </div>

      <div className="main-content">
        <div className="card">
          {/* Toolbar */}
          <div className="card-header">
            {/* Pesquisa */}
            <div className="search-bar flex-1" style={{ minWidth: 180 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Pesquisar empresas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="filter-dropdown">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setFilterOpen((v) => !v)}
              >
                ⚙️ Filtros
              </button>
              {filterOpen && (
                <FilterPanel
                  fields={FILTER_FIELDS}
                  checked={filtros}
                  onChange={setFiltros}
                  onClose={() => setFilterOpen(false)}
                />
              )}
            </div>

            <button className="btn btn-primary btn-sm" onClick={abrirNovaEmpresa}>
              + Adicionar
            </button>
          </div>

          {/* Tabela */}
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-container">
                <span className="spinner spinner-lg" />
                <span>Carregando...</span>
              </div>
            ) : empresasFiltradas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏢</div>
                <div className="empty-state-title">Nenhuma empresa encontrada</div>
                <div className="empty-state-text">Cadastre a primeira empresa usando o botão Adicionar.</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    {filtros.has('id')            && <th>ID</th>}
                    {filtros.has('razao_social')  && <th>Razão Social</th>}
                    {filtros.has('nome_fantasia') && <th>Nome Fantasia</th>}
                    {filtros.has('cnpj')          && <th>CNPJ</th>}
                    <th style={{ width: 80 }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((e) => (
                    <tr key={e.id}>
                      {filtros.has('id')            && <td>{e.id}</td>}
                      {filtros.has('razao_social')  && <td>{e.razao_social}</td>}
                      {filtros.has('nome_fantasia') && <td>{e.nome_fantasia}</td>}
                      {filtros.has('cnpj')          && <td>{e.cnpj}</td>}
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => abrirEditarEmpresa(e)}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Modal Empresa ════════════════════════════════════════════════════ */}
      <Modal
        open={modalEmpresa}
        onClose={fecharModalEmpresa}
        title={empresa.id ? `Empresa #${empresa.id}` : 'Nova Empresa'}
        size="lg"
        stackLevel={0}
        footer={
          <>
            {empresa.id && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmDeleteEmpresa(true)}
                style={{ marginRight: 'auto' }}
              >
                🗑️ Excluir
              </button>
            )}
            <button className="btn btn-secondary" onClick={fecharModalEmpresa}>
              Cancelar
            </button>
            <button
              className="btn btn-success"
              onClick={salvarEmpresa}
              disabled={savingEmpresa}
            >
              {savingEmpresa ? <span className="spinner" /> : '💾 Salvar'}
            </button>
          </>
        }
      >
        {erroEmpresa && <div className="alert alert-danger">{erroEmpresa}</div>}

        {/* Campos da empresa */}
        <div className="form-row cols-2">
          <div className="form-group">
            <label className="form-label">ID</label>
            <input className="form-control" value={empresa.id ?? '—'} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              className="form-control"
              value={empresa.cnpj}
              onChange={(e) => setEmpresa({ ...empresa, cnpj: maskCNPJ(e.target.value) })}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Razão Social *</label>
            <input
              className="form-control"
              value={empresa.razao_social}
              onChange={(e) => setEmpresa({ ...empresa, razao_social: e.target.value })}
              placeholder="Razão Social"
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nome Fantasia *</label>
            <input
              className="form-control"
              value={empresa.nome_fantasia}
              onChange={(e) => setEmpresa({ ...empresa, nome_fantasia: e.target.value })}
              placeholder="Nome Fantasia"
            />
          </div>
        </div>

        {/* Tabela de Logins */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <div
            className="d-flex align-center justify-between"
            style={{ marginBottom: '0.75rem' }}
          >
            <h4 style={{ fontSize: '0.9rem' }}>Logins da Empresa</h4>
            <button className="btn btn-primary btn-sm" onClick={abrirNovoLogin}>
              + Adicionar Login
            </button>
          </div>

          {logins.length === 0 ? (
            <p className="text-muted text-small">Nenhum login cadastrado.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Login</th>
                    <th style={{ width: 80 }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.login}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => abrirEditarLogin(l)}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* ═══ Modal Login ══════════════════════════════════════════════════════ */}
      <Modal
        open={modalLogin}
        onClose={fecharModalLogin}
        title={loginForm.id ? `Login #${loginForm.id}` : 'Novo Login'}
        size="sm"
        stackLevel={1}
        footer={
          <>
            {loginForm.id && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmDeleteLogin(true)}
                style={{ marginRight: 'auto' }}
              >
                🗑️ Excluir
              </button>
            )}
            <button className="btn btn-secondary" onClick={fecharModalLogin}>
              Cancelar
            </button>
            <button
              className="btn btn-success"
              onClick={salvarLogin}
              disabled={savingLogin}
            >
              {savingLogin ? <span className="spinner" /> : '💾 Salvar'}
            </button>
          </>
        }
      >
        {erroLogin && <div className="alert alert-danger">{erroLogin}</div>}

        <div className="form-group">
          <label className="form-label">ID</label>
          <input className="form-control" value={loginForm.id ?? '—'} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Login *</label>
          <input
            className="form-control"
            value={loginForm.login}
            onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
            placeholder="Nome de usuário"
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Senha *</label>
          <input
            className="form-control"
            type="password"
            value={loginForm.senha}
            onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
            placeholder="Senha"
            autoComplete="new-password"
          />
        </div>
      </Modal>

      {/* ═══ Confirm excluir empresa ══════════════════════════════════════════ */}
      <ConfirmModal
        open={confirmDeleteEmpresa}
        onClose={() => setConfirmDeleteEmpresa(false)}
        onConfirm={excluirEmpresa}
        loading={deletingEmpresa}
        stackLevel={1}
        message={`Excluir a empresa "${empresa.nome_fantasia}" e todos os seus logins?`}
      />

      {/* ═══ Confirm excluir login ════════════════════════════════════════════ */}
      <ConfirmModal
        open={confirmDeleteLogin}
        onClose={() => setConfirmDeleteLogin(false)}
        onConfirm={excluirLogin}
        loading={deletingLogin}
        stackLevel={2}
        message={`Excluir o login "${loginForm.login}"?`}
      />
    </div>
  );
}
