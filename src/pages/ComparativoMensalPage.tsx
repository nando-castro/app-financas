import { Card, CardContent } from "@/components/ui/card";
import { estatisticasApi } from "@/services/api";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, ReceiptText, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Tipo = "RENDA" | "DESPESA";
type Item = { tipo: Tipo; categoria: string; valorAtual: number; valorAnterior: number; diferenca: number; percentual: number; nova: boolean };
type Totais = { valorAtual: number; valorAnterior: number; diferenca: number; percentual: number };
type Dados = { periodoAnterior: { mes: number; ano: number }; resumo: { rendas: Totais; despesas: Totais }; categorias: Item[] };
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Variacao({ item, tipo }: { item: Item; tipo: Tipo }) {
  const subiu = item.diferenca > 0, caiu = item.diferenca < 0;
  const favoravel = tipo === "RENDA" ? subiu : caiu;
  const cor = !subiu && !caiu ? "text-slate-500 bg-slate-100 dark:bg-slate-800" : favoravel ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300" : "text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300";
  const Icon = subiu ? ArrowUpRight : caiu ? ArrowDownRight : ArrowRight;
  return <div className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${cor}`}><Icon size={16} />{item.nova ? "Novo" : `${Math.abs(item.percentual).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}</div>;
}

function Resumo({ titulo, tipo, totais }: { titulo: string; tipo: Tipo; totais: Totais }) {
  const Icon = tipo === "RENDA" ? CircleDollarSign : ReceiptText;
  const favoravel = tipo === "RENDA" ? totais.diferenca >= 0 : totais.diferenca <= 0;
  return <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"><CardContent className="p-0">
    <div className={`h-1.5 ${tipo === "RENDA" ? "bg-emerald-500" : "bg-rose-500"}`} />
    <div className="p-5"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 font-semibold"><Icon size={20} />{titulo}</div><span className={`text-sm font-semibold ${favoravel ? "text-emerald-600" : "text-rose-600"}`}>{totais.diferenca >= 0 ? "+" : "−"}{moeda.format(Math.abs(totais.diferenca))}</span></div>
      <p className="text-3xl font-bold tracking-tight">{moeda.format(totais.valorAtual)}</p><p className="mt-1 text-sm text-slate-500">antes {moeda.format(totais.valorAnterior)} · {Math.abs(totais.percentual).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% {totais.diferenca >= 0 ? "maior" : "menor"}</p>
    </div></CardContent></Card>;
}

export default function ComparativoMensalPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1), [ano, setAno] = useState(hoje.getFullYear());
  const [dados, setDados] = useState<Dados | null>(null), [carregando, setCarregando] = useState(true);
  useEffect(() => { let ativo = true; setCarregando(true); estatisticasApi.comparativoCategorias(mes, ano).then(({ data }) => { if (ativo) setDados(data); }).catch(() => toast.error("Não foi possível carregar o comparativo.")).finally(() => { if (ativo) setCarregando(false); }); return () => { ativo = false; }; }, [mes, ano]);
  const grupos = useMemo(() => ({ RENDA: dados?.categorias.filter(i => i.tipo === "RENDA") ?? [], DESPESA: dados?.categorias.filter(i => i.tipo === "DESPESA") ?? [] }), [dados]);

  return <div className="mx-auto max-w-7xl space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl md:px-8"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" /><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-300"><CalendarDays size={17} />Comparação mensal</div><h1 className="text-2xl font-bold tracking-tight md:text-4xl">Para onde seu dinheiro foi?</h1><p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">Compare ganhos e gastos por categoria com o mês anterior e encontre as maiores mudanças.</p></div>
      <div className="flex gap-2 rounded-2xl bg-white/10 p-2"><select aria-label="Mês" value={mes} onChange={e => setMes(Number(e.target.value))} className="min-w-36 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm">{meses.map((nome, i) => <option key={nome} value={i + 1}>{nome}</option>)}</select><select aria-label="Ano" value={ano} onChange={e => setAno(Number(e.target.value))} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm">{Array.from({ length: 9 }, (_, i) => hoje.getFullYear() - 5 + i).map(y => <option key={y}>{y}</option>)}</select></div>
    </div></section>
    {carregando ? <div className="flex min-h-72 items-center justify-center text-slate-500"><RefreshCw className="mr-2 animate-spin" size={20} />Carregando comparação...</div> : dados && <>
      <div className="grid gap-4 md:grid-cols-2"><Resumo titulo="Ganhos no mês" tipo="RENDA" totais={dados.resumo.rendas} /><Resumo titulo="Gastos no mês" tipo="DESPESA" totais={dados.resumo.despesas} /></div>
      {(["RENDA", "DESPESA"] as Tipo[]).map(tipo => <section key={tipo} className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-lg font-bold">{tipo === "RENDA" ? "Ganhos por categoria" : "Gastos por categoria"}</h2><p className="text-sm text-slate-500">comparado com {meses[dados.periodoAnterior.mes - 1]} de {dados.periodoAnterior.ano}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${tipo === "RENDA" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{grupos[tipo].length} categorias</span></div>
        {grupos[tipo].length === 0 ? <p className="p-10 text-center text-slate-500">Nenhum lançamento nesses dois meses.</p> : <div className="divide-y"><div className="hidden grid-cols-[minmax(180px,1.4fr)_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid dark:bg-slate-950/50"><span>Categoria</span><span>{meses[mes - 1]}</span><span>{meses[dados.periodoAnterior.mes - 1]}</span><span>Diferença</span><span>Variação</span></div>
          {grupos[tipo].map(item => { const maximo = Math.max(item.valorAtual, item.valorAnterior, 1); const favoravel = tipo === "RENDA" ? item.diferenca > 0 : item.diferenca < 0; return <div key={`${tipo}-${item.categoria}`} className="grid gap-4 px-5 py-5 transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(180px,1.4fr)_1fr_1fr_1fr_120px] md:items-center dark:hover:bg-slate-800/40"><div><p className="font-semibold">{item.categoria}</p><div className="mt-2 flex h-1.5 gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={tipo === "RENDA" ? "bg-emerald-500" : "bg-rose-500"} style={{ width: `${item.valorAtual / maximo * 100}%` }} /><div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${item.valorAnterior / maximo * 100}%` }} /></div></div><div><span className="text-xs text-slate-500 md:hidden">Mês escolhido</span><p className="font-semibold">{moeda.format(item.valorAtual)}</p></div><div><span className="text-xs text-slate-500 md:hidden">Mês anterior</span><p>{moeda.format(item.valorAnterior)}</p></div><div><span className="text-xs text-slate-500 md:hidden">Diferença</span><p className={`font-semibold ${item.diferenca === 0 ? "text-slate-500" : favoravel ? "text-emerald-600" : "text-rose-600"}`}>{item.diferenca > 0 ? "+" : item.diferenca < 0 ? "−" : ""}{moeda.format(Math.abs(item.diferenca))}</p></div><Variacao item={item} tipo={tipo} /></div>; })}</div>}
      </section>)}
    </>}
  </div>;
}
