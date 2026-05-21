import React from 'react';

export default function Agenda() {
  return (
    <div className="content-area">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📅</div>
          <div className="empty-state-title">Agenda em Manutenção</div>
          <div className="empty-state-text">
            Este recurso está sendo desenvolvido e em breve estará disponível.
          </div>
        </div>
      </div>
    </div>
  );
}
