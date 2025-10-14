import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [resumo, setResumo] = useState<any>(null);
  const [tendencia, setTendencia] = useState<any[]>([]);
  const [ultimasRendas, setUltimasRendas] = useState<any[]>([]);
  const [ultimasDespesas, setUltimasDespesas] = useState<any[]>([]);
  const { theme } = useTheme();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  async function carregarResumo() {
    const { data } = await api.get(
      `/financas/estatisticas/mensal?mes=${mesAtual}&ano=${anoAtual}`
    );
    setResumo(data);
  }

  async function carregarTendencia() {
    const { data } = await api.get(`/financas/tendencia`);
    setTendencia(data.meses || []);
  }

  async function carregarUltimas() {
    const [rendas, despesas] = await Promise.all([
      api.get("/financas/tipo/RENDA"),
      api.get("/financas/tipo/DESPESA"),
    ]);

    // pegar só as 5 mais recentes
    setUltimasRendas(rendas.data.slice(0, 5));
    setUltimasDespesas(despesas.data.slice(0, 5));
  }

  useEffect(() => {
    carregarResumo();
    carregarTendencia();
    carregarUltimas();
  }, []);

  if (!resumo) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Resumo mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ArrowUpCircle className="text-green-600" size={20} />
            <CardTitle>Rendas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">
            R$ {resumo.totalRendas.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <ArrowDownCircle className="text-red-600" size={20} />
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            R$ {resumo.totalDespesas.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="text-blue-600" size={20} />
            <CardTitle>Saldo</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              resumo.saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {resumo.saldo.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <CardTitle>Economia</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-600">
            {resumo.percentualEconomia}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Rendas e Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={tendencia}
              style={{
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", // fundo escuro ou branco
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === "dark" ? "#334155" : "#e5e7eb"} // grid adaptado
              />
              <XAxis
                dataKey="mes"
                tick={{ fill: theme === "dark" ? "#f1f5f9" : "#1f2937" }} // cor dos ticks
                axisLine={{ stroke: theme === "dark" ? "#475569" : "#9ca3af" }}
              />
              <YAxis
                tick={{ fill: theme === "dark" ? "#f1f5f9" : "#1f2937" }}
                axisLine={{ stroke: theme === "dark" ? "#475569" : "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                  borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                  color: theme === "dark" ? "#f8fafc" : "#111827",
                }}
              />
              <Line
                type="monotone"
                dataKey="rendas"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Rendas"
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Últimas movimentações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Rendas</CardTitle>
          </CardHeader>
          <CardContent>
            {ultimasRendas.length === 0 ? (
              <p className="text-slate-500">Nenhuma renda recente.</p>
            ) : (
              <ul className="space-y-2">
                {ultimasRendas.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between border-b border-slate-100 pb-1"
                  >
                    <span>{r.nome}</span>
                    <span className="text-green-600 font-medium">
                      +R$ {r.valor.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {ultimasDespesas.length === 0 ? (
              <p className="text-slate-500">Nenhuma despesa recente.</p>
            ) : (
              <ul className="space-y-2">
                {ultimasDespesas.map((d) => (
                  <li
                    key={d.id}
                    className="flex justify-between border-b border-slate-100 pb-1"
                  >
                    <span>{d.nome}</span>
                    <span className="text-red-600 font-medium">
                      -R$ {d.valor.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensagem final */}
      <Card>
        <CardContent className="text-center py-4 text-slate-700">
          {resumo.recomendacao}
        </CardContent>
      </Card>
    </div>
  );
}
