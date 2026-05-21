import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ROUTES from '../routes';

/**
 * Componente para marcar e descrever dentes no exame clínico.
 * Props:
 *   exameClinicoId  — ID do exame clínico
 *   editando        — boolean, está em modo edição
 *   onChange        — fn(dentesEditando), callback quando dentes são alterados
 *   onDelete        — fn(denteId), callback quando um dente é deletado (opcional)
 */
export default function DentesExameClinico({ exameClinicoId, editando, onChange, onDelete, endpoint, titulo, tipo }) {
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    console.log(
      `📍 Posição detectada: X: ${x.toFixed(2)}% | Y: ${y.toFixed(2)}%`
    );
  };
  // Hotspots de cada dente (número, posição, x%, y%)
  const HOTSPOTS = [
    // Vestibular (superior)
    { numero: 18, posicao: 'Vestibular', x: 3.79, y: 20.16 },
    { numero: 17, posicao: 'Vestibular', x: 9.75, y: 20.44 },
    { numero: 16, posicao: 'Vestibular', x: 16.26, y: 20.72 },
    { numero: 15, posicao: 'Vestibular', x: 22.04, y: 19.60 },
    { numero: 14, posicao: 'Vestibular', x: 27.82, y: 19.60 },
    { numero: 13, posicao: 'Vestibular', x: 34.14, y: 20.72 },
    { numero: 12, posicao: 'Vestibular', x: 39.38, y: 20.72 },
    { numero: 11, posicao: 'Vestibular', x: 45.70, y: 19.32 },
    { numero: 21, posicao: 'Vestibular', x: 53.11, y: 20.44 },
    { numero: 22, posicao: 'Vestibular', x: 58.89, y: 19.60 },
    { numero: 23, posicao: 'Vestibular', x: 64.49, y: 20.72 },
    { numero: 24, posicao: 'Vestibular', x: 70.99, y: 19.60 },
    { numero: 25, posicao: 'Vestibular', x: 76.23, y: 19.60 },
    { numero: 26, posicao: 'Vestibular', x: 81.83, y: 20.44 },
    { numero: 27, posicao: 'Vestibular', x: 87.97, y: 20.44 },
    { numero: 28, posicao: 'Vestibular', x: 94.47, y: 20.44 },
    // Oclusal (superior)
    { numero: 18, posicao: 'Oclusal', x: 3.43, y: 29.41 },
    { numero: 17, posicao: 'Oclusal', x: 10.48, y: 29.13 },
    { numero: 16, posicao: 'Oclusal', x: 17.16, y: 29.13 },
    { numero: 15, posicao: 'Oclusal', x: 22.22, y: 29.13 },
    { numero: 14, posicao: 'Oclusal', x: 27.64, y: 28.57 },
    { numero: 13, posicao: 'Oclusal', x: 33.42, y: 28.57 },
    { numero: 12, posicao: 'Oclusal', x: 39.56, y: 28.57 },
    { numero: 11, posicao: 'Oclusal', x: 45.70, y: 29.13 },
    { numero: 21, posicao: 'Oclusal', x: 52.93, y: 29.41 },
    { numero: 22, posicao: 'Oclusal', x: 58.71, y: 29.41 },
    { numero: 23, posicao: 'Oclusal', x: 64.85, y: 29.69 },
    { numero: 24, posicao: 'Oclusal', x: 70.63, y: 28.57 },
    { numero: 25, posicao: 'Oclusal', x: 76.05, y: 29.69 },
    { numero: 26, posicao: 'Oclusal', x: 81.11, y: 29.41 },
    { numero: 27, posicao: 'Oclusal', x: 87.97, y: 29.41 },
    { numero: 28, posicao: 'Oclusal', x: 95.20, y: 29.69 },
    // Palatina (superior)
    { numero: 18, posicao: 'Palatina', x: 3.97, y: 39.70 },
    { numero: 17, posicao: 'Palatina', x: 9.76, y: 39.47 },
    { numero: 16, posicao: 'Palatina', x: 17.00, y: 39.70 },
    { numero: 15, posicao: 'Palatina', x: 21.93, y: 39.70 },
    { numero: 14, posicao: 'Palatina', x: 27.72, y: 39.47 },
    { numero: 13, posicao: 'Palatina', x: 33.81, y: 39.47 },
    { numero: 12, posicao: 'Palatina', x: 39.60, y: 38.80 },
    { numero: 11, posicao: 'Palatina', x: 45.39, y: 39.25 },
    { numero: 21, posicao: 'Palatina', x: 52.93, y: 38.80 },
    { numero: 22, posicao: 'Palatina', x: 59.01, y: 38.80 },
    { numero: 23, posicao: 'Palatina', x: 64.51, y: 38.80 },
    { numero: 24, posicao: 'Palatina', x: 70.60, y: 38.80 },
    { numero: 25, posicao: 'Palatina', x: 76.10, y: 39.25 },
    { numero: 26, posicao: 'Palatina', x: 81.89, y: 38.80 },
    { numero: 27, posicao: 'Palatina', x: 88.56, y: 39.47 },
    { numero: 28, posicao: 'Palatina', x: 94.35, y: 39.25 },
    // Palatina (inferior)
    { numero: 48, posicao: 'Palatina', x: 2.81, y: 61.46 },
    { numero: 47, posicao: 'Palatina', x: 10.05, y: 61.46 },
    { numero: 46, posicao: 'Palatina', x: 17.00, y: 61.46 },
    { numero: 45, posicao: 'Palatina', x: 23.67, y: 61.23 },
    { numero: 44, posicao: 'Palatina', x: 28.88, y: 60.78 },
    { numero: 43, posicao: 'Palatina', x: 35.25, y: 60.78 },
    { numero: 42, posicao: 'Palatina', x: 40.90, y: 61.23 },
    { numero: 41, posicao: 'Palatina', x: 46.12, y: 61.68 },
    { numero: 31, posicao: 'Palatina', x: 52.06, y: 61.01 },
    { numero: 32, posicao: 'Palatina', x: 57.27, y: 60.11 },
    { numero: 33, posicao: 'Palatina', x: 62.78, y: 60.78 },
    { numero: 34, posicao: 'Palatina', x: 69.29, y: 60.56 },
    { numero: 35, posicao: 'Palatina', x: 74.65, y: 61.46 },
    { numero: 36, posicao: 'Palatina', x: 81.60, y: 61.46 },
    { numero: 37, posicao: 'Palatina', x: 88.56, y: 61.46 },
    { numero: 38, posicao: 'Palatina', x: 95.51, y: 61.91 },
    // Incisal (inferior)
    { numero: 48, posicao: 'Incisal', x: 3.10, y: 69.62 },
    { numero: 47, posicao: 'Incisal', x: 10.28, y: 69.62 },
    { numero: 46, posicao: 'Incisal', x: 17.01, y: 69.62 },
    { numero: 45, posicao: 'Incisal', x: 23.43, y: 69.62 },
    { numero: 44, posicao: 'Incisal', x: 29.24, y: 69.62 },
    { numero: 43, posicao: 'Incisal', x: 35.36, y: 71.05 },
    { numero: 42, posicao: 'Incisal', x: 40.56, y: 70.57 },
    { numero: 41, posicao: 'Incisal', x: 46.21, y: 70.10 },
    { numero: 31, posicao: 'Incisal', x: 52.17, y: 70.10 },
    { numero: 32, posicao: 'Incisal', x: 57.37, y: 71.05 },
    { numero: 33, posicao: 'Incisal', x: 62.57, y: 70.57 },
    { numero: 34, posicao: 'Incisal', x: 68.99, y: 70.57 },
    { numero: 35, posicao: 'Incisal', x: 74.19, y: 70.10 },
    { numero: 36, posicao: 'Incisal', x: 81.22, y: 70.10 },
    { numero: 37, posicao: 'Incisal', x: 87.95, y: 70.10 },
    { numero: 38, posicao: 'Incisal', x: 95.59, y: 70.10 },
    // Vestibular (inferior)
    { numero: 48, posicao: 'Vestibular', x: 2.79, y: 80.56 },
    { numero: 47, posicao: 'Vestibular', x: 9.52, y: 80.56 },
    { numero: 46, posicao: 'Vestibular', x: 16.40, y: 81.27 },
    { numero: 45, posicao: 'Vestibular', x: 23.13, y: 80.56 },
    { numero: 44, posicao: 'Vestibular', x: 28.94, y: 80.56 },
    { numero: 43, posicao: 'Vestibular', x: 35.05, y: 80.09 },
    { numero: 42, posicao: 'Vestibular', x: 40.86, y: 80.09 },
    { numero: 41, posicao: 'Vestibular', x: 46.06, y: 79.61 },
    { numero: 31, posicao: 'Vestibular', x: 52.17, y: 80.28 },
    { numero: 32, posicao: 'Vestibular', x: 57.22, y: 80.28 },
    { numero: 33, posicao: 'Vestibular', x: 63.03, y: 80.28 },
    { numero: 34, posicao: 'Vestibular', x: 69.14, y: 79.80 },
    { numero: 35, posicao: 'Vestibular', x: 74.80, y: 79.80 },
    { numero: 36, posicao: 'Vestibular', x: 81.38, y: 80.99 },
    { numero: 37, posicao: 'Vestibular', x: 88.41, y: 80.28 },
    { numero: 38, posicao: 'Vestibular', x: 95.14, y: 80.99 },
  ];

  // Estado
  const [dentesEditando, setDentesEditando] = useState({});     // { "numero_posicao": { id, numero, posicao, descricao } }
  const [dentesSalvos, setDentesSalvos] = useState({});         // mesmo formato
  const [dentesAtivos, setDentesAtivos] = useState(new Set());  // Set { "numero_posicao" }
  const [loading, setLoading] = useState(true);

  // Carrega dentes salvos do backend
  useEffect(() => {
    if (!exameClinicoId) return;
    
    const fetchDentes = async () => {
      try {
        const { data } = await api.get(endpoint(exameClinicoId));
        const dentesMap = {};
        data.forEach((dente) => {
          const key = `${dente.dente_numero}_${dente.dente_posicao}`;
          dentesMap[key] = dente;
        });
        setDentesSalvos(dentesMap);
        setDentesAtivos(new Set(Object.keys(dentesMap)));
        setDentesEditando({});
      } catch (error) {
        console.error('Erro ao carregar dentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDentes();
  }, [exameClinicoId]);

  // Notifica parent quando dentesEditando muda
  useEffect(() => {
    onChange?.(dentesEditando);
  }, [dentesEditando, onChange]);

  // Alterna seleção de dente
  const toggleDente = (numero, posicao) => {
    const key = `${numero}_${posicao}`;
    const novosDentesAtivos = new Set(dentesAtivos);
    
    if (novosDentesAtivos.has(key)) {
      // Desativa — remove de ambos os estados
      novosDentesAtivos.delete(key);
      
      // Se o dente estava salvo (tem ID), notifica parent que deve ser deletado
      if (dentesSalvos[key]?.id) {
        onDelete?.(dentesSalvos[key].id);
      }
      
      setDentesEditando((prev) => {
        const novo = { ...prev };
        delete novo[key];
        return novo;
      });
    } else {
      // Ativa — inicia com descrição vazia se novo, ou recupera se salvos
      novosDentesAtivos.add(key);
      setDentesEditando((prev) => ({
        ...prev,
        [key]: prev[key] || {
          id: dentesSalvos[key]?.id || null,
          dente_numero: numero,
          dente_posicao: posicao,
          dente_descricao: dentesSalvos[key]?.dente_descricao || '',
        },
      }));
    }
    
    setDentesAtivos(novosDentesAtivos);
  };

  // Atualiza descrição de dente
  const handleDescricaoChange = (numero, posicao, valor) => {
    const key = `${numero}_${posicao}`;
    setDentesEditando((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        dente_descricao: valor,
      },
    }));
  };

  // Ordena dentes para exibição: número ascendente, depois posição alfabética
  const dentesOrdenados = Array.from(dentesAtivos).sort((a, b) => {
    const [numA, posA] = a.split('_');
    const [numB, posB] = b.split('_');
    const numAInt = parseInt(numA);
    const numBInt = parseInt(numB);
    
    if (numAInt !== numBInt) return numAInt - numBInt;
    return posA.localeCompare(posB);
  });

  if (loading) {
    return <div className="spinner spinner-sm" />;
  }

  const getMostroHotspot = (numero, posicao) => {
    const key = `${numero}_${posicao}`;
    return dentesAtivos.has(key);
  };

  return (
    <div className="dentes-exame-clinico">
      {/* Imagem com Hotspots */}
      {titulo && (
        <div className="dentes-titulo">
          {titulo}
        </div>
      )}
      <div className="dentes-imagem-container">
        <img onClick={handleImageClick} src={ROUTES.media('/media/ExameClinico/ExameClinico.jpeg')} alt="Mapa de dentes" className="dentes-imagem" />
        
        {/* Botões hotspots */}
        {HOTSPOTS.map((hotspot) => {
          const key = `${hotspot.numero}_${hotspot.posicao}`;
          const isAtivo = getMostroHotspot(hotspot.numero, hotspot.posicao);
          
          return (
            <button
              key={key}
              className={`dente-hotspot${isAtivo ? ' ativo' : ''}`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              onClick={() => {
                if (editando) {
                  toggleDente(hotspot.numero, hotspot.posicao);
                }
              }}
              title={`Dente ${hotspot.numero} - ${hotspot.posicao}`}
              disabled={!editando}
            />
          );
        })}
      </div>

      {/* Descrições de dentes marcados */}
      {dentesOrdenados.length > 0 && (
        <div className="dentes-descricoes">
          {dentesOrdenados.map((key) => {
            const dente = dentesEditando[key] || dentesSalvos[key];
            return (
              <div key={key} className="dente-descricao-item">
                <label className="dente-descricao-label">
                  O dente {dente.dente_numero}, de posição {dente.dente_posicao} está:
                </label>
                <textarea
                  className="dente-descricao-textarea"
                  placeholder="Descreva o problema ou condição..."
                  value={dente.dente_descricao || ''}
                  onChange={(e) =>
                    handleDescricaoChange(dente.dente_numero, dente.dente_posicao, e.target.value)
                  }
                  disabled={!editando}
                  rows={3}
                />
              </div>
            );
          })}
        </div>
      )}

      {dentesOrdenados.length === 0 && !editando && (
        <div className="empty-state empty-state-sm">
          <span className="empty-state-icon">🦷</span>
          <span className="empty-state-text">Nenhum dente marcado</span>
        </div>
      )}
    </div>
  );
}
