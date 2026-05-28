import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import dayjs from "dayjs";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [resumo, setResumo] = useState<any>(null);
  const [categoriasRenda, setCategoriasRenda] = useState<any[]>([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState<any[]>([]);
  const { theme } = useTheme();

  // Estado para o mês e ano selecionados
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  const cores = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
    "#F97316",
    "#6366F1",
    "#F87171",
    "#FBBF24",
    "#063fb1",
    "#fbbf24",
    "#610101",
    "#7e5a00",
  ];

  // 🔹 Carregar resumo financeiro
  async function carregarResumo(m: number, a: number) {
    const { data } = await api.get(
      `/financas/estatisticas/mensal?mes=${m}&ano=${a}`,
    );
    setResumo(data);
  }

  // 🔹 Carregar categorias (RENDA / DESPESA)
  async function carregarCategorias(m: number, a: number) {
    const { data } = await api.get(
      `/financas/estatisticas/categorias?mes=${m}&ano=${a}`,
    );
    const rendas = data.filter((item: any) => item.tipo === "RENDA");
    const despesas = data.filter((item: any) => item.tipo === "DESPESA");
    setCategoriasRenda(rendas);
    setCategoriasDespesa(despesas);
  }

  // 🔹 Atualizar tudo ao alterar mês/ano
  useEffect(() => {
    carregarResumo(mes, ano);
    carregarCategorias(mes, ano);
  }, [mes, ano]);

  // 🔹 Alterar mês e ano manualmente
  function mudarMes(e: React.ChangeEvent<HTMLSelectElement>) {
    setMes(Number(e.target.value));
  }

  function mudarAno(e: React.ChangeEvent<HTMLSelectElement>) {
    setAno(Number(e.target.value));
  }

  if (!resumo) return <p className="text-center mt-10">Carregando...</p>;

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);

  const salario = Number(resumo.totalRendas ?? 0);
  const despesas = Number(resumo.totalDespesas ?? 0);
  const saldo = Number(resumo.saldo ?? salario - despesas);

  const percentualDespesa =
    salario > 0 ? Number(((despesas / salario) * 100).toFixed(2)) : 0;

  const percentualSaldo =
    salario > 0 ? Number(((saldo / salario) * 100).toFixed(2)) : 0;

  const dadosComparativo = [
    {
      nome: "Salário",
      valor: salario,
      percentual: salario > 0 ? 100 : 0,
      cor: "#10B981",
    },
    {
      nome: "Despesas",
      valor: despesas,
      percentual: percentualDespesa,
      cor: "#EF4444",
    },
    {
      nome: "Saldo livre",
      valor: saldo,
      percentual: Math.max(percentualSaldo, 0),
      cor: "#3B82F6",
    },
  ];

  const limiteGrafico = Math.max(100, percentualDespesa);

  return (
    <div className="space-y-6">
      {/* Filtros de mês/ano */}
      <div className="flex flex-wrap justify-end items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-600" size={18} />
          <select
            value={mes}
            onChange={mudarMes}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {dayjs()
                  .month(m - 1)
                  .format("MMMM")}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={mudarAno}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {Array.from({ length: 6 }, (_, i) => 2022 + i).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          <CardHeader>
            <CardTitle>Economia</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-600">
            {resumo.percentualEconomia}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de pizza */}
      <Card>
        <CardHeader>
          <CardTitle>
            Distribuição por Categorias —{" "}
            {dayjs()
              .month(mes - 1)
              .format("MMMM")}{" "}
            / {ano}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rendas */}
            <div className="flex flex-col items-center">
              <h3 className="text-green-600 font-semibold mb-2">Rendas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasRenda}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ categoria, percent }) =>
                      `${categoria} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoriasRenda.map((_, index) => (
                      <Cell
                        key={`renda-${index}`}
                        fill={cores[index % cores.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `R$ ${value.toFixed(2)}`,
                      "Valor",
                    ]}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                      color: theme === "dark" ? "#f8fafc" : "#111827",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Despesas */}
            <div className="flex flex-col items-center">
              <h3 className="text-red-600 font-semibold mb-2">Despesas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasDespesa}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ categoria, percent }) =>
                      `${categoria} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoriasDespesa.map((_, index) => (
                      <Cell
                        key={`despesa-${index}`}
                        fill={cores[index % cores.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `R$ ${value.toFixed(2)}`,
                      "Valor",
                    ]}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                      color: theme === "dark" ? "#f8fafc" : "#111827",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de porcentagens por categoria */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lista de Rendas */}
            <div>
              <h3 className="text-green-600 font-semibold mb-2 text-center">
                Detalhamento das Rendas
              </h3>
              {categoriasRenda.length === 0 ? (
                <p className="text-center text-slate-500">
                  Nenhuma renda encontrada.
                </p>
              ) : (
                <ul className="space-y-2">
                  {(() => {
                    const totalRenda = categoriasRenda.reduce(
                      (acc, c) => acc + c.total,
                      0,
                    );
                    return [...categoriasRenda]
                      .sort((a, b) => b.total - a.total) // 🔹 Ordena do maior pro menor
                      .map((c, i) => {
                        const porcentagem = (c.total / totalRenda) * 100;
                        return (
                          <li
                            key={`renda-lista-${i}`}
                            className="flex justify-between items-center border-b border-slate-100 pb-1"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: cores[i % cores.length],
                                }}
                              ></span>
                              {c.categoria}
                            </span>
                            <span className="text-green-600 font-medium">
                              {porcentagem.toFixed(1)}% — R${" "}
                              {c.total.toFixed(2)}
                            </span>
                          </li>
                        );
                      });
                  })()}
                </ul>
              )}
            </div>

            {/* Lista de Despesas */}
            <div>
              <h3 className="text-red-600 font-semibold mb-2 text-center">
                Detalhamento das Despesas
              </h3>
              {categoriasDespesa.length === 0 ? (
                <p className="text-center text-slate-500">
                  Nenhuma despesa encontrada.
                </p>
              ) : (
                <ul className="space-y-2">
                  {(() => {
                    const totalDespesa = categoriasDespesa.reduce(
                      (acc, c) => acc + c.total,
                      0,
                    );
                    return [...categoriasDespesa]
                      .sort((a, b) => b.total - a.total) // 🔹 Ordena do maior pro menor
                      .map((c, i) => {
                        const porcentagem = (c.total / totalDespesa) * 100;
                        return (
                          <li
                            key={`despesa-lista-${i}`}
                            className="flex justify-between items-center border-b border-slate-100 pb-1"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: cores[i % cores.length],
                                }}
                              ></span>
                              {c.categoria}
                            </span>
                            <span className="text-red-600 font-medium">
                              {porcentagem.toFixed(1)}% — R${" "}
                              {c.total.toFixed(2)}
                            </span>
                          </li>
                        );
                      });
                  })()}
                </ul>
              )}
            </div>

            {/* Comparativo das despesas em relação ao salário */}
            <div className="mt-8">
              <h3 className="text-blue-600 font-semibold mb-2 text-center">
                Despesas em relação ao salário
              </h3>

              {categoriasDespesa.length === 0 ? (
                <p className="text-center text-slate-500">
                  Nenhuma despesa encontrada.
                </p>
              ) : resumo.totalRendas <= 0 ? (
                <p className="text-center text-slate-500">
                  Nenhuma renda encontrada para calcular o comparativo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {(() => {
                    const totalRenda = Number(resumo.totalRendas || 0);

                    return [...categoriasDespesa]
                      .sort((a, b) => b.total - a.total)
                      .map((c, i) => {
                        const porcentagemSalario = (c.total / totalRenda) * 100;

                        return (
                          <li
                            key={`despesa-salario-${i}`}
                            className="flex justify-between items-center border-b border-slate-100 pb-1"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: cores[i % cores.length],
                                }}
                              ></span>
                              {c.categoria}
                            </span>

                            <span className="text-blue-600 font-medium">
                              {porcentagemSalario.toFixed(1)}% do salário — R${" "}
                              {c.total.toFixed(2)}
                            </span>
                          </li>
                        );
                      });
                  })()}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo salário x despesas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Comparação da despesa em relação ao salário —{" "}
            {dayjs()
              .month(mes - 1)
              .format("MMMM")}{" "}
            / {ano}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {salario <= 0 ? (
            <p className="text-center text-slate-500 py-6">
              Nenhuma renda encontrada para calcular o comparativo.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Salário/Rendas
                  </p>
                  <strong className="text-xl text-green-600">
                    {formatarMoeda(salario)}
                  </strong>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Despesas
                  </p>
                  <strong className="text-xl text-red-600">
                    {formatarMoeda(despesas)}
                  </strong>
                  <p className="text-sm text-red-500 mt-1">
                    {percentualDespesa.toFixed(2)}% do salário
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Saldo livre
                  </p>
                  <strong
                    className={`text-xl ${
                      saldo >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {formatarMoeda(saldo)}
                  </strong>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                    {percentualSaldo.toFixed(2)}% do salário
                  </p>
                </div>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosComparativo}
                    layout="vertical"
                    margin={{ top: 10, right: 70, left: 20, bottom: 10 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, limiteGrafico]}
                      tickFormatter={(value) => `${value}%`}
                    />

                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={90}
                      tick={{ fontSize: 13 }}
                    />

                    <Tooltip
                      formatter={(_, __, props) => {
                        const item = props.payload;

                        return [
                          `${item.percentual.toFixed(2)}% — ${formatarMoeda(
                            item.valor,
                          )}`,
                          item.nome,
                        ];
                      }}
                      contentStyle={{
                        backgroundColor:
                          theme === "dark" ? "#1e293b" : "#f9fafb",
                        borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
                        color: theme === "dark" ? "#f8fafc" : "#111827",
                      }}
                    />

                    <Bar dataKey="percentual" radius={[0, 8, 8, 0]}>
                      {dadosComparativo.map((item) => (
                        <Cell key={item.nome} fill={item.cor} />
                      ))}

                      <LabelList
                        dataKey="percentual"
                        position="right"
                        formatter={(value: number) => `${value.toFixed(2)}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {despesas > salario && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Suas despesas ultrapassaram o salário em{" "}
                  {(percentualDespesa - 100).toFixed(2)}%.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mensagem final */}
      <Card>
        <CardContent className="text-center py-4 text-slate-700">
          {resumo.recomendacao}
        </CardContent>
      </Card>
    </div>
  );
}
