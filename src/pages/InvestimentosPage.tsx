import { InvestimentoAporteDialog } from "@/components/financas/InvestimentoAporteDialog";
import { InvestimentoAportesDialog } from "@/components/financas/InvestimentoAportesDialog";
import { InvestimentoDialog } from "@/components/financas/InvestimentoDialog";
import { Button } from "@/components/ui/button";
import { investimentosApi } from "@/services/api";
import {
  CalendarDays,
  CircleDollarSign,
  History,
  PauseCircle,
  Pencil,
  PiggyBank,
  Plus,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(2)}% a.m.`;
}

function formatDateBR(date: string) {
  if (!date) return "-";
  const [ano, mes, dia] = date.split("-");
  return `${dia}/${mes}/${ano}`;
}

type InvestimentoResumoItem = {
  investimentoId: number;
  nome: string;
  valorInicial: number;
  taxaMensal: number;
  aporteMensalAtual: number;
  dataInicio: string;
  valorProjetado: number;
  rendimentoAcumulado: number;
  mesesProjetados: number;
  mes: number;
  ano: number;
};

type InvestimentoFormData = {
  id?: number;
  nome?: string;
  valorInicial?: number;
  taxaMensal?: number;
  aporteMensal?: number;
  dataInicio?: string;
} | null;

export default function InvestimentosPage() {
  const hoje = new Date();

  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [investimentos, setInvestimentos] = useState<InvestimentoResumoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvestimento, setEditingInvestimento] =
    useState<InvestimentoFormData>(null);

  const [aporteDialogOpen, setAporteDialogOpen] = useState(false);
  const [aporteDialogMode, setAporteDialogMode] = useState<"alterar" | "parar">(
    "alterar",
  );
  const [aporteInvestimentoId, setAporteInvestimentoId] = useState<number | null>(
    null,
  );

  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [historicoInvestimentoId, setHistoricoInvestimentoId] = useState<number | null>(
    null,
  );

  async function buscar() {
    try {
      setLoading(true);
      const { data } = await investimentosApi.resumo(mes, ano);
      setInvestimentos(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, [mes, ano]);

  const meses = useMemo(
    () => [
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
    ],
    [],
  );

  const resumo = useMemo(() => {
    const totalInvestido = investimentos.reduce(
      (acc, item) => acc + Number(item.valorInicial || 0),
      0,
    );

    const totalProjetado = investimentos.reduce(
      (acc, item) => acc + Number(item.valorProjetado || 0),
      0,
    );

    const totalRendimento = investimentos.reduce(
      (acc, item) => acc + Number(item.rendimentoAcumulado || 0),
      0,
    );

    const totalAportesAtuais = investimentos.reduce(
      (acc, item) => acc + Number(item.aporteMensalAtual || 0),
      0,
    );

    return {
      totalInvestido,
      totalProjetado,
      totalRendimento,
      totalAportesAtuais,
    };
  }, [investimentos]);

  function abrirNovo() {
    setEditingInvestimento(null);
    setOpenDialog(true);
  }

  function abrirEditar(item: InvestimentoResumoItem) {
    setEditingInvestimento({
      id: item.investimentoId,
      nome: item.nome,
      valorInicial: item.valorInicial,
      taxaMensal: item.taxaMensal,
      dataInicio: item.dataInicio,
    });
    setOpenDialog(true);
  }

  function abrirAlterarAporte(investimentoId: number) {
    setAporteInvestimentoId(investimentoId);
    setAporteDialogMode("alterar");
    setAporteDialogOpen(true);
  }

  function abrirPararAporte(investimentoId: number) {
    setAporteInvestimentoId(investimentoId);
    setAporteDialogMode("parar");
    setAporteDialogOpen(true);
  }

  function abrirHistoricoAportes(investimentoId: number) {
    setHistoricoInvestimentoId(investimentoId);
    setHistoricoDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus Investimentos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o valor investido, a projeção futura e o histórico de aportes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={buscar}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </Button>

          <Button onClick={abrirNovo} className="gap-2">
            <Plus size={18} />
            Novo Investimento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl border bg-muted/40 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-sm font-medium leading-none">Período da projeção</p>
              <p className="text-xs text-muted-foreground">
                Selecione o mês e o ano para simular quanto terá acumulado
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">Mês</span>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="bg-transparent text-sm outline-none"
              >
                {meses.map((nome, i) => (
                  <option key={i} value={i + 1}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">Ano</span>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="bg-transparent text-sm outline-none"
              >
                {Array.from({ length: 11 }, (_, i) => hoje.getFullYear() - 2 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="ml-auto text-xs text-muted-foreground">
              Projeção para {String(mes).padStart(2, "0")}/{ano}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <p className="text-sm font-medium">Resumo da projeção</p>

          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Wallet size={16} />
                Total investido
              </span>
              <span className="font-medium">{formatBRL(resumo.totalInvestido)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp size={16} />
                Rendimentos
              </span>
              <span className="font-medium text-emerald-600">
                {formatBRL(resumo.totalRendimento)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <PiggyBank size={16} />
                Aportes atuais
              </span>
              <span className="font-medium">{formatBRL(resumo.totalAportesAtuais)}</span>
            </div>

            <div className="h-px bg-border my-1" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <PiggyBank size={16} />
                Total projetado
              </span>
              <span className="font-semibold">{formatBRL(resumo.totalProjetado)}</span>
            </div>
          </div>
        </div>
      </div>

      {investimentos.length === 0 ? (
        <div className="rounded-2xl border bg-background p-10 text-center shadow-sm">
          <p className="text-base font-medium">Nenhum investimento cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em “Novo Investimento” para cadastrar e acompanhar a projeção.
          </p>

          <div className="mt-4">
            <Button onClick={abrirNovo} className="gap-2">
              <Plus size={18} />
              Novo Investimento
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {investimentos.map((item) => {
            const valorInicial = Number(item.valorInicial || 0);
            const valorProjetado = Number(item.valorProjetado || 0);
            const rendimentoAcumulado = Number(item.rendimentoAcumulado || 0);
            const aporteMensalAtual = Number(item.aporteMensalAtual || 0);

            return (
              <div
                key={item.investimentoId}
                className="rounded-2xl border bg-background p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl border bg-muted/40 flex items-center justify-center">
                      <CircleDollarSign size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold uppercase tracking-wide text-sm truncate">
                        {item.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Início: {formatDateBR(item.dataInicio)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => abrirEditar(item)}
                    title="Editar investimento"
                  >
                    <Pencil size={16} />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Valor investido</p>
                    <p className="font-medium mt-1">{formatBRL(valorInicial)}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Rendimento mensal</p>
                    <p className="font-medium mt-1">{formatPercent(item.taxaMensal)}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Aporte mensal atual</p>
                    <p className="font-medium mt-1">{formatBRL(aporteMensalAtual)}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Valor projetado em {String(mes).padStart(2, "0")}/{ano}
                    </p>
                    <p className="font-semibold mt-1">{formatBRL(valorProjetado)}</p>
                  </div>

                  <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-3">
                    <p className="text-xs text-emerald-700">Rendimento acumulado</p>
                    <p className="font-semibold mt-1 text-emerald-700">
                      {formatBRL(rendimentoAcumulado)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 col-span-2"
                    onClick={() => abrirAlterarAporte(item.investimentoId)}
                  >
                    <TrendingUp size={14} />
                    Alterar aporte
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 col-span-2"
                    onClick={() => abrirPararAporte(item.investimentoId)}
                  >
                    <PauseCircle size={14} />
                    Parar aporte
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 col-span-2"
                    onClick={() => abrirHistoricoAportes(item.investimentoId)}
                  >
                    <History size={14} />
                    Histórico de aportes
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InvestimentoDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onSave={buscar}
        initialData={editingInvestimento}
      />

      <InvestimentoAporteDialog
        open={aporteDialogOpen}
        setOpen={setAporteDialogOpen}
        onSave={buscar}
        investimentoId={aporteInvestimentoId}
        mode={aporteDialogMode}
      />

      <InvestimentoAportesDialog
        open={historicoDialogOpen}
        setOpen={setHistoricoDialogOpen}
        investimentoId={historicoInvestimentoId}
        onChanged={buscar}
      />
    </div>
  );
}