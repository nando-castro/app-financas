import { CartaoDetalhesSheet } from "@/components/financas/CartaoDetalhesSheet";
import { CartoesDialog } from "@/components/financas/CartoesDialog";
import { Button } from "@/components/ui/button";
import { cartoesApi } from "@/services/api";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function pct(used: number, limit: number) {
  if (!limit || limit <= 0) return 0;
  const p = (used / limit) * 100;
  return Math.max(0, Math.min(100, p));
}

type SaldoCartaoItem = {
  cartaoId: number;
  nome: string;
  limite: number; // limite vigente no período
  limiteUtilizado: number; // acumulado (faturas comunicando)
  limiteDisponivel: number;
  faturaAtual: number; // total do mês (compras + ajuste)
  emAbertoMes: number; // saldo em aberto do mês
  mes: number;
  ano: number;

  // campos opcionais se sua API também enviar
  limiteBase?: number;
  diaFechamento?: number | null;
  diaVencimento?: number | null;
};

export default function CartoesPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [saldos, setSaldos] = useState<SaldoCartaoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCartao, setEditingCartao] = useState<any>(null);

  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [cartaoIdDetalhes, setCartaoIdDetalhes] = useState<number | null>(null);

  async function buscar() {
    try {
      setLoading(true);
      const { data } = await cartoesApi.saldos(mes, ano);
      setSaldos(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Agora o resumo do mês usa o acumulado (limiteUtilizado/limiteDisponivel)
  const resumo = useMemo(() => {
    const limite = saldos.reduce((acc, c) => acc + Number(c.limite || 0), 0);
    const utilizado = saldos.reduce(
      (acc, c) => acc + Number(c.limiteUtilizado || 0),
      0,
    );
    const disponivel = saldos.reduce(
      (acc, c) => acc + Number(c.limiteDisponivel || 0),
      0,
    );

    // extras úteis
    const emAbertoMes = saldos.reduce(
      (acc, c) => acc + Number(c.emAbertoMes || 0),
      0,
    );
    const faturaAtual = saldos.reduce(
      (acc, c) => acc + Number(c.faturaAtual || 0),
      0,
    );

    return { limite, utilizado, disponivel, emAbertoMes, faturaAtual };
  }, [saldos]);

  function abrirNovo() {
    setEditingCartao(null);
    setOpenDialog(true);
  }

  function abrirEditar(c: SaldoCartaoItem) {
    setEditingCartao({
      id: c.cartaoId,
      nome: c.nome,
      limite: c.limiteBase ?? c.limite,
      diaFechamento: c.diaFechamento,
      diaVencimento: c.diaVencimento,
    });
    setOpenDialog(true);
  }

  function abrirDetalhes(cartaoId: number) {
    setCartaoIdDetalhes(cartaoId);
    setOpenDetalhes(true);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus Cartões</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe limite, fatura e disponibilidade por mês.
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
            <Plus size={18} /> Novo Cartão
          </Button>
        </div>
      </div>

      {/* Filtros + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Filtros */}
        <div className="lg:col-span-2 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl border bg-muted/40 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Período</p>
              <p className="text-xs text-muted-foreground">
                Selecione mês e ano para ver a fatura
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
                {Array.from({ length: 6 }, (_, i) => hoje.getFullYear() - 2 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="ml-auto text-xs text-muted-foreground">
              {String(mes).padStart(2, "0")}/{ano}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <p className="text-sm font-medium">Resumo do mês</p>

          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <ArrowUpRight size={16} />
                Limite total
              </span>
              <span className="font-medium">{formatBRL(resumo.limite)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <ArrowDownRight size={16} />
                Utilizado (acumulado)
              </span>
              <span className="font-medium">{formatBRL(resumo.utilizado)}</span>
            </div>

            <div className="h-px bg-border my-1" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Disponível</span>
              <span className="font-semibold">{formatBRL(resumo.disponivel)}</span>
            </div>

            <div className="mt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Uso do limite</span>
                <span>{pct(resumo.utilizado, resumo.limite).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${pct(resumo.utilizado, resumo.limite)}%` }}
                />
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Em aberto no mês: {formatBRL(resumo.emAbertoMes)} • Total do mês:{" "}
              {formatBRL(resumo.faturaAtual)}
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      {saldos.length === 0 ? (
        <div className="rounded-2xl border bg-background p-10 text-center shadow-sm">
          <p className="text-base font-medium">Nenhum cartão cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em “Novo Cartão” para cadastrar e acompanhar o limite.
          </p>
          <div className="mt-4">
            <Button onClick={abrirNovo} className="gap-2">
              <Plus size={18} /> Novo Cartão
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {saldos.map((c) => {
            const limite = Number(c.limite || 0);
            const utilizado = Number(c.limiteUtilizado || 0);
            const disponivel = Number(c.limiteDisponivel || 0);
            const emAbertoMes = Number(c.emAbertoMes || 0);

            const percent = pct(utilizado, limite);

            return (
              <div
                key={c.cartaoId}
                className="rounded-2xl border bg-background p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => abrirDetalhes(c.cartaoId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border bg-muted/40 flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold uppercase tracking-wide text-sm truncate">
                        {c.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {String(mes).padStart(2, "0")}/{ano}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {percent.toFixed(0)}%
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditar(c);
                      }}
                      title="Editar cartão"
                    >
                      <Pencil size={16} />
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uso do limite (acumulado)</span>
                    <span>
                      {formatBRL(utilizado)} / {formatBRL(limite)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Limite</p>
                    <p className="font-medium mt-1">{formatBRL(limite)}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Em aberto (mês)</p>
                    <p className="font-medium mt-1">{formatBRL(emAbertoMes)}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="font-semibold mt-1">{formatBRL(disponivel)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CartoesDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onSave={buscar}
        initialData={editingCartao}
      />

      <CartaoDetalhesSheet
        open={openDetalhes}
        setOpen={setOpenDetalhes}
        cartaoId={cartaoIdDetalhes}
        mes={mes}
        ano={ano}
        onChanged={buscar}
      />
    </div>
  );
}
