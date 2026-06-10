import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const financasApi = {
  gerarRelatorio: (mes: number, ano: number) =>
    api.get("/financas/relatorio/pdf", {
      params: { mes, ano },
      responseType: "blob",
    }),
};

// services/api.ts (trecho)
export const cartoesApi = {
  listar: () => api.get("/cartoes"),
  criar: (payload: { nome: string; limite: number }) =>
    api.post("/cartoes", payload),
  saldos: (mes: number, ano: number) =>
    api.get("/cartoes/saldos", { params: { mes, ano } }),
  detalhesFatura: (cartaoId: number, mes: number, ano: number) =>
    api.get(`/cartoes/${cartaoId}/fatura`, { params: { mes, ano } }),
  ajustarFatura: (cartaoId: number, payload: any) =>
    api.patch(`/cartoes/${cartaoId}/fatura`, payload),
  atualizarCartao: (cartaoId: number, payload: any) =>
    api.patch(`/cartoes/${cartaoId}`, payload),
  criarLancamento: (cartaoId: number, payload: any) =>
    api.post(`/cartoes/${cartaoId}/lancamentos`, payload),
};

export const investimentosApi = {
  resumo: (mes: number, ano: number) =>
    api.get("/investimentos/resumo", {
      params: { mes, ano },
    }),

  create: (payload: {
    nome: string;
    valorInicial: number;
    taxaMensal: number;
    aporteMensal?: number;
    dataInicio: string;
  }) => api.post("/investimentos", payload),

  update: (
    id: number,
    payload: {
      nome?: string;
      valorInicial?: number;
      taxaMensal?: number;
      dataInicio?: string;
    },
  ) => api.put(`/investimentos/${id}`, payload),

  remove: (id: number) => api.delete(`/investimentos/${id}`),

  listarAportes: (id: number) => api.get(`/investimentos/${id}/aportes`),

  alterarAporte: (
    id: number,
    payload: {
      valorMensal: number;
      dataInicio: string;
    },
  ) => api.patch(`/investimentos/${id}/aporte`, payload),

  pararAporte: (
    id: number,
    payload: {
      dataParada: string;
    },
  ) => api.patch(`/investimentos/${id}/aporte/parar`, payload),

  removerAporteProgramado: (id: number, aporteId: number) =>
    api.delete(`/investimentos/${id}/aportes/${aporteId}`),
};
export type RegraPercentualPayload = {
  nome: string;
  percentual: number;
  basePercentual: "TOTAL_RENDAS" | "CATEGORIA_RENDA";
  categoriaId?: number;
  mesReferencia?: number;
  anoReferencia?: number;
  dataInicio?: string;
  dataFim?: string;
};

export const regrasPercentuaisApi = {
  listar: (mes?: number, ano?: number) =>
    api.get("/regras-percentuais", {
      params: {
        ...(mes ? { mes } : {}),
        ...(ano ? { ano } : {}),
      },
    }),

  buscar: (id: number) => api.get(`/regras-percentuais/${id}`),

  criar: (payload: RegraPercentualPayload) =>
    api.post("/regras-percentuais", payload),

  atualizar: (id: number, payload: RegraPercentualPayload) =>
    api.put(`/regras-percentuais/${id}`, payload),

  remover: (id: number) => api.delete(`/regras-percentuais/${id}`),

  calcular: (id: number) => api.get(`/regras-percentuais/${id}/calcular`),
};

export const categoriasApi = {
  listar: () => api.get("/categorias"),

  buscarPorTipo: (tipo: "RENDA" | "DESPESA") =>
    api.get("/categorias", {
      params: { tipo },
    }),
};

export const estatisticasApi = {
  mensal: (mes?: number, ano?: number) =>
    api.get("/financas/estatisticas/mensal", {
      params: { mes, ano },
    }),

  anual: (ano?: number) =>
    api.get("/financas/estatisticas/anual", {
      params: { ano },
    }),

  tendencia: () => api.get("/financas/estatisticas/tendencia"),

  categorias: (mes?: number, ano?: number) =>
    api.get("/financas/estatisticas/categorias", {
      params: { mes, ano },
    }),

  categoriasTipoLancamento: (mes?: number, ano?: number) =>
    api.get("/financas/estatisticas/categorias-tipo-lancamento", {
      params: { mes, ano },
    }),

  comparativoSalarioDespesa: (mes?: number, ano?: number) =>
    api.get("/financas/estatisticas/comparativo-salario-despesa", {
      params: { mes, ano },
    }),
};

export default api;
