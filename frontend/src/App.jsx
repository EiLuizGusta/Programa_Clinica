import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import Login from './pages/Login';
import GerenciarCadastros from './pages/GerenciarCadastros';
import Principal from './pages/Principal';
import Ficha from './pages/Ficha';

// Proteção de rota — redireciona para /login se não houver token
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/gerenciar-cadastros" element={<GerenciarCadastros />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Principal />
            </PrivateRoute>
          }
        />
        <Route
          path="/ficha/:pacienteId"
          element={
            <PrivateRoute>
              <Ficha />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
