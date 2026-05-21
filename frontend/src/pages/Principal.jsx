import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pacientes from './Pacientes';
import Agenda from './Agenda';
import pacientesIcon from '../icons/contato.png';
import agendaIcon from '../icons/agenda.png';
import sairIcon from '../icons/sair.png';
import iconePadrao from '../icons/icone.png';
import imgBotaoRecolher from '../icons/menu.png';

const MENU_ITEMS = [
  { id: 'pacientes', label: 'Pacientes', icon: pacientesIcon, component: Pacientes },
  { id: 'agenda', label: 'Agenda', icon: agendaIcon, component: Agenda },
];

export default function Principal() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('pacientes');
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

  // Detectar mudanças de tamanho de tela
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Botão unificado: muda comportamento conforme tamanho da tela
  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarMobileOpen(!sidebarMobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const closeMobileSidebar = () => {
    setSidebarMobileOpen(false);
  };

  const empresa = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('empresa')); } catch { return null; }
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const ActiveComponent = MENU_ITEMS.find(item => item.id === activeMenu)?.component || Pacientes;

  return (
    <div className="app-container">
      {/* Sidebar Flutuante Mobile (Modal) */}
      {sidebarMobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={closeMobileSidebar}>
          <aside className="sidebar-mobile" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho da Sidebar Mobile */}
            <div className="sidebar-header">
              <div className="sidebar-header-top">
                <button className="btn-icon-toggle" onClick={closeMobileSidebar} title="Fechar menu">
                  <img src={imgBotaoRecolher} alt="Ícone Fechar Menu" />
                </button>

                {empresa?.logo ? (
                  <img src={empresa.logo} alt="Logo" className="sidebar-logo" />
                ) : (
                  <img
                    src={iconePadrao}
                    alt="Clínica"
                    className="sidebar-default-icon"
                  />
                )}
              </div>

              {empresa?.nome_fantasia && (
                <span className="sidebar-title">{empresa.nome_fantasia}</span>
              )}
            </div>

            {/* Menu Items */}
            <nav className="sidebar-nav">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveMenu(item.id);
                    closeMobileSidebar();
                  }}
                >
                  <img src={item.icon} alt={item.label} className="sidebar-item-icon" />
                  <span className="sidebar-item-label">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Botão Sair */}
            <div className="sidebar-footer">
              <button
                className="sidebar-logout"
                onClick={logout}
              >
                <img src={sairIcon} alt="Sair" className="sidebar-item-icon" />
                <span className="sidebar-item-label">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className={`sidebar sidebar-desktop ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Cabeçalho da Sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <button className="btn-icon-toggle" onClick={handleToggleSidebar} title="Recolher menu">
              <img src={imgBotaoRecolher} alt="Ícone Recolher Menu" />
            </button>

            {sidebarOpen && (empresa?.logo ? (
              <img src={empresa.logo} alt="Logo" className="sidebar-logo" />
            ) : (
              <img
                src={iconePadrao}
                alt="Clínica"
                className="sidebar-default-icon"
              />
            ))}
          </div>

          {sidebarOpen && empresa?.nome_fantasia && (
            <span className="sidebar-title">{empresa.nome_fantasia}</span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
              title={!sidebarOpen ? item.label : ''}
            >
              <img src={item.icon} alt={item.label} className="sidebar-item-icon" />
              {sidebarOpen && <span className="sidebar-item-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Botão Sair */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={logout}
            title={!sidebarOpen ? 'Sair' : ''}
          >
            <img src={sairIcon} alt="Sair" className="sidebar-item-icon" />
            {sidebarOpen && <span className="sidebar-item-label">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="main-wrapper">
        {/* Conteúdo da Página */}
        <main className="app-main">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}