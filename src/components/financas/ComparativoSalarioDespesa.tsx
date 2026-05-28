import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EstatisticaMensal = {
  totalRendas: number;
  totalDespesas: number;
  saldo: number;
};

type Props = {
  mensal: EstatisticaMensal | null;
  mesLabel: string;
  ano: number;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

export function ComparativoSalarioDespesa({ mensal, mesLabel, ano }: Props) {
  const salario = Number(mensal?.totalRendas ?? 0);
  const despesas = Number(mensal?.totalDespesas ?? 0);
  const saldo = Number(mensal?.saldo ?? salario - despesas);

  const percentualDespesa =
    salario > 0 ? Number(((despesas / salario) * 100).toFixed(2)) : 0;

  const percentualSaldo =
    salario > 0 ? Number(((saldo / salario) * 100).toFixed(2)) : 0;

  const percentualSaldoGrafico = Math.max(percentualSaldo, 0);

  const dados = [
    {
      nome: "Salário",
      valor: salario,
      percentual: salario > 0 ? 100 : 0,
      cor: "#00b050",
    },
    {
      nome: "Despesas",
      valor: despesas,
      percentual: percentualDespesa,
      cor: "#ef4444",
    },
    {
      nome: "Saldo livre",
      valor: saldo,
      percentual: percentualSaldoGrafico,
      cor: "#2563eb",
    },
  ];

  const limiteGrafico = Math.max(100, percentualDespesa);

  return (
    <Card className="mt-6 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Comparação da despesa em relação ao salário — {mesLabel} / {ano}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {salario <= 0 ? (
          <p className="text-center text-slate-500 py-6">
            Nenhuma renda/salário encontrado para este mês.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Salário/Rendas</p>
                <strong className="text-xl text-emerald-600">
                  {formatarMoeda(salario)}
                </strong>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Despesas</p>
                <strong className="text-xl text-red-600">
                  {formatarMoeda(despesas)}
                </strong>
                <p className="text-sm text-red-500 mt-1">
                  {percentualDespesa.toFixed(2)}% do salário
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Saldo livre</p>
                <strong
                  className={`text-xl ${
                    saldo >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {formatarMoeda(saldo)}
                </strong>
                <p className="text-sm text-slate-500 mt-1">
                  {percentualSaldo.toFixed(2)}% do salário
                </p>
              </div>
            </div>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dados}
                  layout="vertical"
                  margin={{ top: 10, right: 60, left: 20, bottom: 10 }}
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
                  />

                  <Bar dataKey="percentual" radius={[0, 8, 8, 0]}>
                    {dados.map((item) => (
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
  );
}
