const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ROUTES = {
  // ── Autenticação ──────────────────────────────────────────────────────────
  login: () => `${API_BASE_URL}/api/auth/login/`,
  tokenRefresh: () => `${API_BASE_URL}/api/token/refresh/`,

  // ── Empresa ───────────────────────────────────────────────────────────────
  empresas: () => `${API_BASE_URL}/api/empresas/`,
  empresa: (id) => `${API_BASE_URL}/api/empresas/${id}/`,

  // ── Login da Empresa ──────────────────────────────────────────────────────
  empresaLogins: () => `${API_BASE_URL}/api/empresa-logins/`,
  empresaLogin: (id) => `${API_BASE_URL}/api/empresa-logins/${id}/`,
  empresaLoginsPorEmpresa: (empresaId) =>
    `${API_BASE_URL}/api/empresa-logins/?empresa_id=${empresaId}`,

  // ── Paciente ──────────────────────────────────────────────────────────────
  pacientes: () => `${API_BASE_URL}/api/pacientes/`,
  paciente: (id) => `${API_BASE_URL}/api/pacientes/${id}/`,

  // ── Anamnese ──────────────────────────────────────────────────────────────
  anamneses: () => `${API_BASE_URL}/api/anamneses/`,
  anamnese: (id) => `${API_BASE_URL}/api/anamneses/${id}/`,
  anamnesesPorPaciente: (pacienteId) =>
    `${API_BASE_URL}/api/anamneses/?paciente_id=${pacienteId}`,

  // ── Exame Clínico ────────────────────────────────────────────────────────────
  examesClinico: () => `${API_BASE_URL}/api/exames-clinicos/`,
  exameClinico: (id) => `${API_BASE_URL}/api/exames-clinicos/${id}/`,
  examesClinicoPorPaciente: (pacienteId) =>
    `${API_BASE_URL}/api/exames-clinicos/?paciente_id=${pacienteId}`,

  // ── Dentes Exame Clínico ─────────────────────────────────────────────────────
  dentesExameClinico: () => `${API_BASE_URL}/api/dentes-exame-clinico/`,
  denteExameClinico: (id) => `${API_BASE_URL}/api/dentes-exame-clinico/${id}/`,
  dentesExameClinicoPorExame: (exameClinicoId) =>
    `${API_BASE_URL}/api/dentes-exame-clinico/?exame_clinico_id=${exameClinicoId}`,
  dentesExameClinicoPosExame: () =>
    `${API_BASE_URL}/api/dentes-exame-clinico-pos-exame/`,

  denteExameClinicoPosExame: (id) =>
    `${API_BASE_URL}/api/dentes-exame-clinico-pos-exame/${id}/`,

  dentesExameClinicoPosExamePorExame: (id) =>
    `${API_BASE_URL}/api/dentes-exame-clinico-pos-exame/?exame_clinico_id=${id}`,

  // ── Mídia (imagens) ───────────────────────────────────────────────────────
  /** Converte um path relativo retornado pelo servidor em URL completa */
  media: (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  },

  /** URL base usada para configurar o axios */
  base: () => API_BASE_URL,
};

export default ROUTES;
