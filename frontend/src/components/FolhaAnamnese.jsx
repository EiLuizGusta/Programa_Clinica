import React from 'react';

// ── Componentes auxiliares (fora da função para evitar recriação) ────────────

const PerguntaMemo = React.memo(function Pergunta({ label, campo, campoObs, labelObs, val, obs, editando, onChange }) {
  const set = (field, value) => onChange?.(field, value);

  return (
    <div className="anamnese-pergunta">
      <div className="anamnese-pergunta-row">
        <span className="anamnese-pergunta-label">{label}</span>
        <div className="anamnese-opcoes">
          <label className="anamnese-radio">
            <input
              type="radio"
              name={campo}
              value="sim"
              checked={val === true}
              disabled={!editando}
              onChange={() => set(campo, true)}
            />
            Sim
          </label>
          <label className="anamnese-radio">
            <input
              type="radio"
              name={campo}
              value="nao"
              checked={val === false}
              disabled={!editando}
              onChange={() => set(campo, false)}
            />
            Não
          </label>
        </div>
      </div>

      {/* Campo de observação — exibe se marcado Sim ou se já tem valor */}
      {campoObs && (val === true || obs) && (
        <div>
          <span className="a4-field-label" style={{ fontSize: '0.7rem' }}>{labelObs ?? 'Observação:'}</span>
          {editando ? (
            <input
              className="anamnese-obs-input"
              value={obs ?? ''}
              onChange={(e) => set(campoObs, e.target.value)}
              placeholder={labelObs ?? 'Descreva...'}
            />
          ) : (
            <div className="anamnese-obs">{obs || '—'}</div>
          )}
        </div>
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

/**
 * Folha A4 — Anamnese.
 * Props:
 *   anamnese — objeto anamnese
 *   editando — boolean
 *   onChange — fn(field, value)
 */
function FolhaAnamnese({ anamnese, editando, onChange }) {
  if (!anamnese) return null;

  const set = (field, value) => onChange?.(field, value);

  return (
    <div className="a4-sheet">
      <div className="a4-title">Anamnese</div>

      {/* Identificação */}
      <div className="a4-section">
        <div className="a4-section-title">Identificação</div>
        <div className="a4-grid">
          <div className="a4-field">
            <span className="a4-field-label">ID da Anamnese</span>
            <span className="a4-field-value">{anamnese.id}</span>
          </div>
          <div className="a4-field">
            <span className="a4-field-label">Data da Anamnese</span>
            <span className="a4-field-value">{anamnese.data_anamnese}</span>
          </div>
        </div>
      </div>

      {/* Queixa principal */}
      <div className="a4-section">
        <div className="a4-section-title">Queixa Principal</div>
        <TextoLivreMemo 
          label="Queixa principal" 
          campo="queixa_principal" 
          linhas={3}
          valor={anamnese.queixa_principal}
          editando={editando}
          onChange={set}
        />
      </div>

      {/* Histórico de saúde */}
      <div className="a4-section">
        <div className="a4-section-title">Histórico de Saúde</div>

        <PerguntaMemo
          label="Está em tratamento médico atualmente?"
          campo="em_tratamento_medico"
          campoObs="em_tratamento_medico_obs"
          labelObs="Qual médico / tratamento?"
          val={anamnese.em_tratamento_medico}
          obs={anamnese.em_tratamento_medico_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Faz uso de algum medicamento regularmente?"
          campo="usa_medicamento"
          campoObs="usa_medicamento_obs"
          labelObs="Qual(is) medicamento(s)?"
          val={anamnese.usa_medicamento}
          obs={anamnese.usa_medicamento_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Tem alergia a algum medicamento ou substância?"
          campo="alergia_medicamento"
          campoObs="alergia_medicamento_obs"
          labelObs="Qual(is) alergia(s)?"
          val={anamnese.alergia_medicamento}
          obs={anamnese.alergia_medicamento_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo label="É diabético(a)?" campo="diabetico" val={anamnese.diabetico} editando={editando} onChange={set} />
        <PerguntaMemo label="Tem pressão alta (hipertensão)?" campo="hipertensao" val={anamnese.hipertensao} editando={editando} onChange={set} />
        <PerguntaMemo label="Tem pressão baixa (hipotensão)?" campo="hipotensao" val={anamnese.hipotensao} editando={editando} onChange={set} />
        <PerguntaMemo
          label="Tem algum problema cardíaco?"
          campo="problema_cardiaco"
          campoObs="problema_cardiaco_obs"
          labelObs="Qual problema cardíaco?"
          val={anamnese.problema_cardiaco}
          obs={anamnese.problema_cardiaco_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Tem algum problema respiratório? (asma, bronquite, rinite…)"
          campo="problema_respiratorio"
          campoObs="problema_respiratorio_obs"
          labelObs="Qual problema respiratório?"
          val={anamnese.problema_respiratorio}
          obs={anamnese.problema_respiratorio_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Já teve hepatite ou doença hepática?"
          campo="hepatite"
          campoObs="hepatite_obs"
          labelObs="Qual hepatite / doença?"
          val={anamnese.hepatite}
          obs={anamnese.hepatite_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo label="Tem algum problema nos rins?" campo="problema_renal" val={anamnese.problema_renal} editando={editando} onChange={set} />
        <PerguntaMemo label="É portador(a) de HIV/AIDS?" campo="hiv" val={anamnese.hiv} editando={editando} onChange={set} />
        <PerguntaMemo label="Tem epilepsia ou convulsões?" campo="epilepsia" val={anamnese.epilepsia} editando={editando} onChange={set} />
        <PerguntaMemo
          label="Tem distúrbio de coagulação ou sangramento excessivo?"
          campo="disturbio_coagulacao"
          val={anamnese.disturbio_coagulacao}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo label="Tem osteoporose ou outro problema ósseo?" campo="osteoporose" val={anamnese.osteoporose} editando={editando} onChange={set} />
        <PerguntaMemo
          label="Tem alguma doença de pele ou dificuldade de cicatrização?"
          campo="doenca_pele"
          campoObs="doenca_pele_obs"
          labelObs="Qual doença / dificuldade?"
          val={anamnese.doenca_pele}
          obs={anamnese.doenca_pele_obs}
          editando={editando}
          onChange={set}
        />
      </div>

      {/* Hábitos de vida */}
      <div className="a4-section">
        <div className="a4-section-title">Hábitos de Vida</div>

        <PerguntaMemo
          label="É fumante?"
          campo="fumante"
          campoObs="fumante_obs"
          labelObs="Quantidade de cigarros por dia?"
          val={anamnese.fumante}
          obs={anamnese.fumante_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Consome bebida alcoólica?"
          campo="alcool"
          campoObs="alcool_obs"
          labelObs="Com que frequência?"
          val={anamnese.alcool}
          obs={anamnese.alcool_obs}
          editando={editando}
          onChange={set}
        />
      </div>

      {/* Saúde feminina */}
      <div className="a4-section">
        <div className="a4-section-title">Saúde Feminina</div>
        <PerguntaMemo label="Está grávida ou suspeita de gravidez?" campo="gravida" val={anamnese.gravida} editando={editando} onChange={set} />
        <PerguntaMemo label="Está amamentando?" campo="amamentando" val={anamnese.amamentando} editando={editando} onChange={set} />
      </div>

      {/* Histórico cirúrgico */}
      <div className="a4-section">
        <div className="a4-section-title">Histórico Cirúrgico / Internações</div>
        <PerguntaMemo
          label="Já realizou alguma cirurgia?"
          campo="historico_cirurgias"
          campoObs="historico_cirurgias_obs"
          labelObs="Qual(is) cirurgia(s)?"
          val={anamnese.historico_cirurgias}
          obs={anamnese.historico_cirurgias_obs}
          editando={editando}
          onChange={set}
        />
        <PerguntaMemo
          label="Já foi internado(a)?"
          campo="historico_internacoes"
          campoObs="historico_internacoes_obs"
          labelObs="Motivo da internação?"
          val={anamnese.historico_internacoes}
          obs={anamnese.historico_internacoes_obs}
          editando={editando}
          onChange={set}
        />
      </div>

      {/* Observações gerais */}
      <div className="a4-section">
        <div className="a4-section-title">Observações Gerais</div>
        <TextoLivreMemo 
          label="Observações" 
          campo="observacoes_gerais" 
          linhas={4}
          valor={anamnese.observacoes_gerais}
          editando={editando}
          onChange={set}
        />
      </div>
    </div>
  );
}

export default React.memo(FolhaAnamnese);
