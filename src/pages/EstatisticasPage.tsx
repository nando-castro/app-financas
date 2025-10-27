import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
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
} from "recharts";

export default function EstatisticasPage() {
  const [dadosMensal, setDadosMensal] = useState<any>(null);
  const [dadosAnual, setDadosAnual] = useState<any[]>([]);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const { theme } = useTheme();

  async function carregarMensal() {
    const { data } = await api.get(
      `/financas/estatisticas/mensal?mes=${mes}&ano=${ano}`
    );
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
        {/* --- Versão Desktop --- */}
        <div className="hidden md:flex flex-wrap gap-3 items-end">
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
              onChange={(e) => {
                const novoAno = Number(e.target.value);
                if (novoAno !== ano) {
                  setAno(novoAno);
                  setMes(1); // 🔹 Reset mês ao mudar de ano
                }
              }}
              className="w-28"
            />
          </div>
          <Button
            onClick={() => {
              carregarMensal();
              carregarAnual();
            }}
          >
            Atualizar
          </Button>
        </div>

        {/* --- Versão Mobile / Tablet --- */}
        <div className="flex flex-wrap gap-2 items-center md:hidden w-full">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border rounded-md px-3 py-2 flex-1"
          >
            {[
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
            ].map((nome, index) => (
              <option key={index} value={index + 1}>
                {nome}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => {
              const novoAno = Number(e.target.value);
              if (novoAno !== ano) {
                setAno(novoAno);
                setMes(1);
              }
            }}
            className="border rounded-md px-3 py-2 flex-1"
          >
            {Array.from(
              { length: 6 },
              (_, i) => new Date().getFullYear() - 2 + i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            className="flex items-center gap-2 w-full justify-center"
            onClick={() => {
              carregarMensal();
              carregarAnual();
            }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Resumo mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Rendas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">
            R$ {dadosMensal.totalRendas.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            R$ {dadosMensal.totalDespesas.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              dadosMensal.saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {dadosMensal.saldo.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Anterior</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              dadosMensal.saldoAnterior >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {dadosMensal.saldoAnterior.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Acumulado</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              dadosMensal.saldoAcumulado >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            R$ {dadosMensal.saldoAcumulado.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Economia</CardTitle>
          </CardHeader>
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
              <BarChart
                data={dadosAnual}
                style={{
                  backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#334155" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: theme === "dark" ? "#f1f5f9" : "#1f2937" }}
                  axisLine={{
                    stroke: theme === "dark" ? "#475569" : "#9ca3af",
                  }}
                />
                <YAxis
                  tick={{ fill: theme === "dark" ? "#f1f5f9" : "#1f2937" }}
                  axisLine={{
                    stroke: theme === "dark" ? "#475569" : "#9ca3af",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                    borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                    color: theme === "dark" ? "#f8fafc" : "#111827",
                  }}
                />
                <Bar
                  dataKey="rendas"
                  fill="#22c55e"
                  name="Rendas"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="despesas"
                  fill="#ef4444"
                  name="Despesas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Mensal (pizza) */}
        <Card>
          <CardHeader>
            <CardTitle>
              Distribuição -{" "}
              {format(new Date(ano, mes - 1, 1), "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart
                style={{
                  backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <Pie
                  data={[
                    { name: "Rendas", value: dadosMensal.totalRendas },
                    { name: "Despesas", value: dadosMensal.totalDespesas },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.name}: ${(
                      (entry.value /
                        (dadosMensal.totalRendas + dadosMensal.totalDespesas)) *
                      100
                    ).toFixed(1)}%`
                  }
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                    borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                    color: theme === "dark" ? "#f8fafc" : "#111827",
                  }}
                />
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
