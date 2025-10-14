import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function EstatisticasPage() {
  const [dadosMensal, setDadosMensal] = useState<any>(null);
  const [dadosAnual, setDadosAnual] = useState<any[]>([]);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const COLORS = ['#16a34a', '#dc2626']; // verde e vermelho

  async function carregarMensal() {
    const { data } = await api.get(`/financas/estatisticas/mensal?mes=${mes}&ano=${ano}`);
    setDadosMensal(data);
  }

  async function carregarAnual() {
    const { data } = await api.get(`/financas/estatisticas/anual?ano=${ano}`);
    setDadosAnual(data.meses);
  }

  useEffect(() => {
    carregarMensal();
    carregarAnual();
  }, [mes, ano]);

  if (!dadosMensal) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-slate-600">Mês</label>
          <Input
            type="number"
            min={1}
            max={12}
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Ano</label>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="w-28"
          />
        </div>
        <Button onClick={() => { carregarMensal(); carregarAnual(); }}>
          Atualizar
        </Button>
      </div>

      {/* Resumo mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Rendas</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">
            R$ {dadosMensal.totalRendas.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Despesas</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            R$ {dadosMensal.totalDespesas.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saldo</CardTitle></CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              dadosMensal.saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            R$ {dadosMensal.saldo.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Economia</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-600">
            {dadosMensal.percentualEconomia}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Anual (barras) */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Anual ({ano})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rendas" fill="#16a34a" name="Rendas" />
                <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Mensal (pizza) */}
        <Card>
          <CardHeader>
            <CardTitle>
              Distribuição - {format(new Date(ano, mes - 1, 1), 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Rendas', value: dadosMensal.totalRendas },
                    { name: 'Despesas', value: dadosMensal.totalDespesas },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {[
                    { name: 'Rendas', value: dadosMensal.totalRendas },
                    { name: 'Despesas', value: dadosMensal.totalDespesas },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recomendação */}
      <Card>
        <CardContent className="text-center py-4 text-slate-700">
          {dadosMensal.recomendacao}
        </CardContent>
      </Card>
    </div>
  );
}
