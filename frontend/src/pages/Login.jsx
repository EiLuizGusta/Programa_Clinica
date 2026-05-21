import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ROUTES from '../routes';
import Modal from '../components/Modal';

export default function Login() {
  const navigate = useNavigate();

  // ── Formulário de login principal ─────────────────────────────────────────
  const [form, setForm]       = useState({ login: '', senha: '' });
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  // ── Modal de acesso ao gerenciador ────────────────────────────────────────
  const [openLogin, setOpenLogin]       = useState(false);
  const [modalLogin, setModalLogin]     = useState({ login: '', senha: '' });
  const [erroModal, setErroModal]       = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  // ── Submit do login principal ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const { data } = await axios.post(ROUTES.login(), form);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('empresa', JSON.stringify(data.empresa));
      navigate('/');
    } catch (err) {
      setErro(
        err.response?.data?.error ||
          'Não foi possível conectar ao servidor. Verifique o IP e a porta.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmar acesso ao gerenciador ──────────────────────────────────────
  const handleConfirmarModal = async () => {
    setLoadingModal(true);
    setErroModal('');
    try {
      await axios.post(`${ROUTES.base()}/api/auth/admin-login/`, {
        login: modalLogin.login,
        senha: modalLogin.senha,
      });
      localStorage.setItem('auth_admin', 'true');
      setOpenLogin(false);
      navigate('/gerenciar-cadastros');
    } catch {
      setErroModal('Login ou senha inválidos.');
    } finally {
      setLoadingModal(false);
    }
  };

  // Fecha o modal e limpa os campos dele
  const fecharModal = () => {
    setOpenLogin(false);
    setModalLogin({ login: '', senha: '' });
    setErroModal('');
  };

  const empresa = (() => {
    try { return JSON.parse(localStorage.getItem('empresa')); } catch { return null; }
  })();

  return (
    <div className="login-page">
      <div className="login-card">
        {empresa?.logo && (
          <div className="login-logo">
            <img src={empresa.logo} alt="Logo" />
          </div>
        )}

        <div className="login-logo">
          <span style={{ fontSize: '2.5rem' }}>🏥</span>
        </div>

        <h2 className="text-center" style={{ fontSize: '1.3rem' }}>
          Sistema de Gestão
        </h2>
        <p className="login-title">Faça login para continuar</p>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              className="form-control"
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Seu login"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Botão fixo canto inferior direito */}
      <div className="login-btn-gerenciar">
        <button
          className="btn btn-secondary"
          onClick={() => setOpenLogin(true)}
          title="Gerenciar empresas e logins"
        >
          ⚙️ Gerenciar cadastros
        </button>
      </div>

      {/* ═══ Modal de acesso restrito ════════════════════════════════════════ */}
      <Modal
        open={openLogin}
        onClose={fecharModal}
        title="Acesso restrito"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={fecharModal} disabled={loadingModal}>
              Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmarModal}
              disabled={loadingModal}
            >
              {loadingModal ? <span className="spinner" /> : 'Confirmar'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              className="form-control"
              placeholder="Login"
              value={modalLogin.login}
              onChange={(e) => setModalLogin({ ...modalLogin, login: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Senha"
              value={modalLogin.senha}
              onChange={(e) => setModalLogin({ ...modalLogin, senha: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          {erroModal && <div className="alert alert-danger">{erroModal}</div>}
        </div>
      </Modal>
    </div>
  );
}
