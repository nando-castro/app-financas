import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// services/api.ts (trecho)
export const cartoesApi = {
  listar: () => api.get('/cartoes'),
  criar: (payload: { nome: string; limite: number }) => api.post('/cartoes', payload),
  saldos: (mes: number, ano: number) => api.get("/cartoes/saldos", { params: { mes, ano } }),
  detalhesFatura: (cartaoId: number, mes: number, ano: number) =>
    api.get(`/cartoes/${cartaoId}/fatura`, { params: { mes, ano } }),
  ajustarFatura: (cartaoId: number, payload: any) => api.patch(`/cartoes/${cartaoId}/fatura`, payload),
  atualizarCartao: (cartaoId: number, payload: any) => api.patch(`/cartoes/${cartaoId}`, payload),
  criarLancamento: (cartaoId: number, payload: any) => api.post(`/cartoes/${cartaoId}/lancamentos`, payload),
};



export default api;
