import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ROUTES from '../routes';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FolhaPaciente from '../components/FolhaPaciente';
import FolhaAnamnese from '../components/FolhaAnamnese';
import FolhaExameClinico from '../components/FolhaExameClinico';

// ── Componentes Container memoizados (fora da função principal) ──────────────
const AnamneseContainerMemo = React.memo(function AnamneseContainer({ 
  anamId, 
  anam, 
  editando, 
  onChangeAnamnese 
}) {
  const handleChange = useCallback((field, value) => {
    onChangeAnamnese(anamId, field, value);
  }, [anamId, onChangeAnamnese]);

  return (
    <FolhaAnamnese
      anamnese={anam}
      editando={editando}
      onChange={handleChange}
    />
  );
});

const ExameClinicoContainerMemo = React.memo(function ExameClinicoContainer({ 
  exameId, 
  exame, 
  editando, 
  onChangeExame,

  dentesEditando = {},
  dentesPosExameEditando = {},

  onChangeDentes,
  onChangeDentesPosExame,

  onDeleteDente,
  onDeleteDentePosExame
}) {

  const handleChange = useCallback((field, value) => {
    onChangeExame(exameId, field, value);
  }, [exameId, onChangeExame]);

  const handleDentesChange = useCallback((dentes) => {
    onChangeDentes?.(exameId, dentes);
  }, [exameId, onChangeDentes]);

  const handleDentesPosExameChange = useCallback((dentes) => {
    onChangeDentesPosExame?.(exameId, dentes);
  }, [exameId, onChangeDentesPosExame]);

  const handleDenteDelete = useCallback((denteId) => {
    onDeleteDente?.(denteId);
  }, [onDeleteDente]);

  const handleDentePosExameDelete = useCallback((denteId) => {
    onDeleteDentePosExame?.(denteId);
  }, [onDeleteDentePosExame]);

  return (
    <FolhaExameClinico
      exameClinico={exame}
      editando={editando}
      onChange={handleChange}

      dentesEditando={dentesEditando}
      dentesPosExameEditando={dentesPosExameEditando}

      onChangeDentes={handleDentesChange}
      onChangeDentesPosExame={handleDentesPosExameChange}

      onDeleteDente={handleDenteDelete}
      onDeleteDentePosExame={handleDentePosExameDelete}
    />
  );
});

// ── Tipos de folha disponíveis ────────────────────────────────────────────────
const TIPOS_FOLHA = [
  { tipo: 'anamnese', label: 'Anamnese', icon: '📋', unica: false },
  { tipo: 'exame_clinico', label: 'Exame Clínico', icon: '🔬', unica: false },
];

const ANAMNESE_VAZIA = {
  paciente: null,
  em_tratamento_medico: false, em_tratamento_medico_obs: '',
  usa_medicamento: false, usa_medicamento_obs: '',
  alergia_medicamento: false, alergia_medicamento_obs: '',
  diabetico: false, hipertensao: false, hipotensao: false,
  problema_cardiaco: false, problema_cardiaco_obs: '',
  problema_respiratorio: false, problema_respiratorio_obs: '',
  hepatite: false, hepatite_obs: '',
  problema_renal: false, hiv: false, epilepsia: false,
  disturbio_coagulacao: false, osteoporose: false,
  gravida: false, amamentando: false,
  fumante: false, fumante_obs: '',
  alcool: false, alcool_obs: '',
  historico_cirurgias: false, historico_cirurgias_obs: '',
  historico_internacoes: false, historico_internacoes_obs: '',
  doenca_pele: false, doenca_pele_obs: '',
  queixa_principal: '', observacoes_gerais: '',
};

const EXAME_CLINICO_VAZIO = {
  paciente: null,
  estado_geral: '',
  peso: null,
  altura: null,
  pulso: null,
  frequencia_cardiaca: null,
};

export default function Ficha() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const empresa = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('empresa')); } catch { return null; }
  }, []);

  // ── Dados ─────────────────────────────────────────────────────────────────
  const [paciente, setPaciente]       = useState(null);
  const [anamneses, setAnamneses]     = useState([]);
  const [examesClinico, setExamesClinico] = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── Edição ────────────────────────────────────────────────────────────────
  const [editando, setEditando]   = useState(false);
  const [editLabel, setEditLabel] = useState('Editar'); // animação do botão
  const [saving, setSaving]       = useState(false);
  const editTimerRef              = useRef(null);

  // ── Estado local de edição (draft) ────────────────────────────────────────
  const [pacDraft, setPacDraft]       = useState(null);
  const [anamDraft, setAnamDraft]     = useState({}); // { id: {...} }
  const [exameDraft, setExameDraft]   = useState({}); // { id: {...} }
  const [dentesEditando, setDentesEditando] = useState({}); // { exameId: { denteKey: {...} } }
  const [dentesDeletados, setDentesDeletados] = useState([]); // [denteId1, denteId2, ...]
  const [dentesPosExameEditando, setDentesPosExameEditando] = useState({});
  const [dentesPosExameDeletados, setDentesPosExameDeletados] = useState([]);

  // ── Modais ────────────────────────────────────────────────────────────────
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [modalExcluir, setModalExcluir]     = useState(false);
  const [selecionados, setSelecionados]     = useState(new Set());
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [deleting, setDeleting]             = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: p }, { data: a }, { data: e }] = await Promise.all([
        api.get(ROUTES.paciente(pacienteId)),
        api.get(ROUTES.anamnesesPorPaciente(pacienteId)),
        api.get(ROUTES.examesClinicoPorPaciente(pacienteId)),
      ]);
      setPaciente(p);
      setAnamneses(a);
      setExamesClinico(e);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  // Inicializa drafts quando dados chegam
  useEffect(() => {
    if (paciente) setPacDraft({ ...paciente });
  }, [paciente]);

  useEffect(() => {
    const drafts = {};
    anamneses.forEach((a) => { drafts[a.id] = { ...a }; });
    setAnamDraft(drafts);
  }, [anamneses]);

  useEffect(() => {
    const drafts = {};
    examesClinico.forEach((e) => { drafts[e.id] = { ...e }; });
    setExameDraft(drafts);
  }, [examesClinico]);

  // ── Editar / Cancelar ─────────────────────────────────────────────────────
  const toggleEditar = () => {
    if (editando) {
      // Cancelar — restaura drafts
      setPacDraft({ ...paciente });
      const draftAnam = {};
      anamneses.forEach((a) => { draftAnam[a.id] = { ...a }; });
      setAnamDraft(draftAnam);
      const draftExame = {};
      examesClinico.forEach((e) => { draftExame[e.id] = { ...e }; });
      setExameDraft(draftExame);
      setDentesEditando({});
      setDentesDeletados([]);
      setDentesPosExameEditando({});
      setDentesPosExameDeletados([]);
      setEditando(false);
      setEditLabel('Editar');
    } else {
      setEditando(true);
      setEditLabel('Editar');
      // Animação: após 1.2s troca label para "Cancelar"
      clearTimeout(editTimerRef.current);
      editTimerRef.current = setTimeout(() => setEditLabel('Cancelar'), 1200);
    }
  };

  useEffect(() => () => clearTimeout(editTimerRef.current), []);

  // ── Salvar alterações ─────────────────────────────────────────────────────
  const salvarEdicao = async () => {
    setSaving(true);
    try {
      // Deleta dentes (Antes do Exame) que foram desativados
      if (dentesDeletados.length > 0) {
        await Promise.all(
          dentesDeletados.map((denteId) =>
            api.delete(ROUTES.denteExameClinico(denteId))
          )
        );
      }

      // Deleta dentes (Após o Exame) que foram desativados
      if (dentesPosExameDeletados.length > 0) {
        await Promise.all(
          dentesPosExameDeletados.map((denteId) =>
            api.delete(ROUTES.denteExameClinicoPosExame(denteId))
          )
        );
      }

      // Salva paciente
      const pacPayload = { ...pacDraft };
      delete pacPayload.assinatura; 
      await api.patch(ROUTES.paciente(pacienteId), pacPayload);

      // Salva cada anamnese editada
      await Promise.all(
        Object.values(anamDraft).map((a) => {
          const payload = { ...a };
          delete payload.id;
          delete payload.data_anamnese;
          delete payload.paciente;
          return api.patch(ROUTES.anamnese(a.id), payload);
        })
      );

      // Salva cada exame clínico editado
      await Promise.all(
        Object.values(exameDraft).map((e) => {
          const payload = { ...e };
          delete payload.id;
          delete payload.data_exame;
          delete payload.paciente;
          return api.patch(ROUTES.exameClinico(e.id), payload);
        })
      );

      // Salva dentes marcados (novos e atualizados)
      for (const [exameId, dentes] of Object.entries(dentesEditando)) {
        for (const [denteKey, denteDados] of Object.entries(dentes)) {
          const payload = {
            exame_clinico: parseInt(exameId),
            dente_numero: denteDados.dente_numero,
            dente_posicao: denteDados.dente_posicao,
            dente_descricao: denteDados.dente_descricao,
          };
          if (denteDados.id) {
            // Atualiza dente existente (Corrigido para PATCH e Rota correta)
            await api.patch(ROUTES.denteExameClinico(denteDados.id), payload);
          } else {
            // Cria novo dente
            await api.post(ROUTES.dentesExameClinico(), payload);
          }
        }
      }

      // Salva dentes pós exame
      for (const [exameId, dentes] of Object.entries(dentesPosExameEditando)) {
        for (const [denteKey, denteDados] of Object.entries(dentes)) {
          const payload = {
            exame_clinico: parseInt(exameId),
            dente_numero: denteDados.dente_numero,
            dente_posicao: denteDados.dente_posicao,
            dente_descricao: denteDados.dente_descricao,
          };

          if (denteDados.id) {

            await api.patch(
              ROUTES.denteExameClinicoPosExame(denteDados.id),
              payload
            );

          } else {

            await api.post(
              ROUTES.dentesExameClinicoPosExame(),
              payload
            );
          }
        }
      }

      setEditando(false);
      setEditLabel('Editar');
      setDentesEditando({});
      setDentesDeletados([]);
      setDentesPosExameEditando({});
      setDentesPosExameDeletados([]);
      await fetchDados();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // ── Adicionar folha ───────────────────────────────────────────────────────
  const adicionarFolha = async (tipo) => {
    setModalAdicionar(false);
    if (tipo === 'anamnese') {
      try {
        await api.post(ROUTES.anamneses(), {
          ...ANAMNESE_VAZIA,
          paciente: Number(pacienteId),
        });
        await fetchDados();
      } catch {
        alert('Erro ao adicionar anamnese.');
      }
    } else if (tipo === 'exame_clinico') {
      try {
        await api.post(ROUTES.examesClinico(), {
          ...EXAME_CLINICO_VAZIO,
          paciente: Number(pacienteId),
        });
        await fetchDados();
      } catch {
        alert('Erro ao adicionar exame clínico.');
      }
    }
  };

  // ── Excluir folhas selecionadas ───────────────────────────────────────────
  const confirmarExclusao = async () => {
    setDeleting(true);
    try {
      // Separa os tipos de folha selecionados
      const anamneseSelecionadas = [...selecionados].filter(s => s.tipo === 'anamnese');
      const examesSelecionados = [...selecionados].filter(s => s.tipo === 'exame_clinico');

      // Deleta anamneses via API
      if (anamneseSelecionadas.length > 0) {
        await Promise.all(
          anamneseSelecionadas.map(({ id }) => api.delete(ROUTES.anamnese(id)))
        );
      }

      // Deleta exames clínicos via API
      if (examesSelecionados.length > 0) {
        await Promise.all(
          examesSelecionados.map(({ id }) => api.delete(ROUTES.exameClinico(id)))
        );
      }

      setSelecionados(new Set());
      setConfirmExcluir(false);
      setModalExcluir(false);

      // Fetch para atualizar os dados
      await fetchDados();
    } catch {
      alert('Erro ao excluir folhas.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelecionar = (tipo, id) => {
    const key = `${tipo}_${id}`;
    setSelecionados((prev) => {
      const next = new Set(prev);
      const found = [...next].find((s) => s.key === key);
      if (found) next.delete(found);
      else next.add({ key, tipo, id });
      return next;
    });
  };

  const isSelecionado = (tipo, id) =>
    [...selecionados].some((s) => s.key === `${tipo}_${id}`);

  // ── Funções memoizadas para evitar re-renderização excessiva ──────────────
  const handlePacienteChange = useCallback((updated) => {
    if (updated.id) {
      setPaciente(updated);
      setPacDraft(updated);
    } else {
      setPacDraft((prev) => ({ ...prev, ...updated }));
    }
  }, []);

  const handleAnamneseChange = useCallback((id, field, value) => {
    setAnamDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }, []);

  const handleExameClinicoChange = useCallback((id, field, value) => {
    setExameDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }, []);

  const handleDentesChange = useCallback((exameId, dentes) => {
    setDentesEditando((prev) => ({
      ...prev,
      [exameId]: dentes,
    }));
  }, []);

  const handleDenteDeleted = useCallback((denteId) => {
    setDentesDeletados((prev) => [...prev, denteId]);
  }, []);

  const handleDentesPosExameChange = useCallback((exameId, dentes) => {
    setDentesPosExameEditando((prev) => ({
      ...prev,
      [exameId]: dentes,
    }));
  }, []);

  const handleDentePosExameDeleted = useCallback((denteId) => {
    setDentesPosExameDeletados((prev) => [...prev, denteId]);
  }, []);

  // ── Paciente único — checa se já existe folha de paciente ─────────────────
  const temFolhaPaciente = !!paciente;

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container" style={{ minHeight: '100dvh' }}>
          <span className="spinner spinner-lg" />
          <span>Carregando ficha...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <header className="ficha-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          ← Voltar
        </button>

        <span className="ficha-paciente-nome">📋 {paciente?.nome ?? `Paciente #${pacienteId}`}</span>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Adicionar */}
          <button className="btn btn-primary btn-sm" onClick={() => setModalAdicionar(true)}>
            + Adicionar
          </button>

          {/* Editar / Cancelar */}
          {editando ? (
            <>
              <button className="btn btn-warning btn-sm" onClick={toggleEditar}>
                {editLabel}
              </button>
              <button className="btn btn-success btn-sm" onClick={salvarEdicao} disabled={saving}>
                {saving ? <span className="spinner" /> : '💾 Salvar'}
              </button>
            </>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={toggleEditar}>
              ✏️ Editar
            </button>
          )}

          {/* Excluir folha */}
          {(anamneses.length > 0 || examesClinico.length > 0) && (
            <button className="btn btn-danger btn-sm" onClick={() => { setSelecionados(new Set()); setModalExcluir(true); }}>
              🗑️ Excluir
            </button>
          )}
        </div>
      </header>

      {/* ── Conteúdo A4 ───────────────────────────────────────────────────── */}
      <div className="a4-container">
        {/* Folha Paciente — sempre presente, única */}
        {temFolhaPaciente && (
          <FolhaPaciente
            paciente={pacDraft ?? paciente}
            empresa={empresa}
            editando={editando}
            onChange={handlePacienteChange}
          />
        )}

        {/* Folhas de Anamnese */}
        {anamneses.map((a) => (
          <AnamneseContainerMemo
            key={a.id}
            anamId={a.id}
            anam={anamDraft[a.id] ?? a}
            editando={editando}
            onChangeAnamnese={handleAnamneseChange}
          />
        ))}

        {/* Folhas de Exame Clínico */}
        {examesClinico.map((e) => (
          <ExameClinicoContainerMemo
            key={e.id}
            exameId={e.id}
            exame={exameDraft[e.id] ?? e}
            editando={editando}
            onChangeExame={handleExameClinicoChange}

            dentesEditando={dentesEditando[e.id] || {}}
            onChangeDentes={handleDentesChange}
            onDeleteDente={handleDenteDeleted}

            dentesPosExameEditando={dentesPosExameEditando[e.id] || {}}
            onChangeDentesPosExame={handleDentesPosExameChange}
            onDeleteDentePosExame={handleDentePosExameDeleted}
          />
        ))}

        {anamneses.length === 0 && examesClinico.length === 0 && !editando && (
          <div className="empty-state" style={{ background: '#fff', padding: '2.5rem', borderRadius: 12, width: '100%', maxWidth: 600 }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Nenhuma folha adicional</div>
            <div className="empty-state-text">Use o botão "+ Adicionar" para incluir anamnese ou exame clínico.</div>
          </div>
        )}
      </div>

      {/* ═══ Modal Adicionar Folha ══════════════════════════════════════════ */}
      <Modal
        open={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        title="Adicionar folha"
        size="sm"
      >
        <div className="selectable-cards">
          {TIPOS_FOLHA.map((t) => (
            <div
              key={t.tipo}
              className="selectable-card"
              onClick={() => adicionarFolha(t.tipo)}
            >
              <span className="card-icon">{t.icon}</span>
              <span className="card-label">{t.label}</span>
            </div>
          ))}
        </div>
        <p className="text-muted text-small text-center" style={{ marginTop: '0.75rem' }}>
          Selecione o tipo de folha para adicionar à ficha.
        </p>
      </Modal>

      {/* ═══ Modal Excluir Folha ════════════════════════════════════════════ */}
      <Modal
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        title="Excluir folha"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalExcluir(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setConfirmExcluir(true)}
              disabled={selecionados.size === 0}
            >
              Excluir selecionadas ({selecionados.size})
            </button>
          </>
        }
      >
        <p className="text-muted text-small" style={{ marginBottom: '0.75rem' }}>
          Toque nas folhas que deseja excluir:
        </p>
        <div className="selectable-cards">
          {anamneses.map((a) => {
            const sel = isSelecionado('anamnese', a.id);
            return (
              <div
                key={a.id}
                className={`selectable-card${sel ? ' selected' : ''}`}
                onClick={() => toggleSelecionar('anamnese', a.id)}
              >
                <span className="card-icon">📋</span>
                <span className="card-label">Anamnese</span>
                <span className="text-small text-muted">{a.data_anamnese}</span>
              </div>
            );
          })}
          {examesClinico.map((e) => {
            const sel = isSelecionado('exame_clinico', e.id);
            return (
              <div
                key={e.id}
                className={`selectable-card${sel ? ' selected' : ''}`}
                onClick={() => toggleSelecionar('exame_clinico', e.id)}
              >
                <span className="card-icon">🔬</span>
                <span className="card-label">Exame Clínico</span>
                <span className="text-small text-muted">{e.data_exame}</span>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* ═══ Confirmação de exclusão de folha ═════════════════════════════ */}
      <ConfirmModal
        open={confirmExcluir}
        onClose={() => setConfirmExcluir(false)}
        onConfirm={confirmarExclusao}
        loading={deleting}
        stackLevel={1}
        message={`Excluir ${selecionados.size} folha(s) selecionada(s)? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
