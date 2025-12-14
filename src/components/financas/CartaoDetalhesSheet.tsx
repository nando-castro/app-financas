import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import api from "@/services/api";
import { CreditCard, Plus, Save, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  cartaoId?: number | null;
  mes: number;
  ano: number;
  onChanged?: () => void; // para refresh da lista
};

export function CartaoDetalhesSheet({ open, setOpen, cartaoId, mes, ano, onChanged }: Props) {
  const [loading, setLoading] = useState(false);
  const [det, setDet] = useState<any>(null);

  const [savingAjustes, setSavingAjustes] = useState(false);
  const [limiteMes, setLimiteMes] = useState<string>("");
  const [ajusteFatura, setAjusteFatura] = useState<string>("");

  const [openLanc, setOpenLanc] = useState<null | "COMPRA" | "PAGAMENTO">(null);
  const [lancForm, setLancForm] = useState({
    descricao: "",
    data: "",
    valor: "",
  });
  const [savingLanc, setSavingLanc] = useState(false);

  async function carregar() {
    if (!cartaoId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/cartoes/${cartaoId}/fatura`, {
        params: { mes, ano },
      });
      setDet(data);

      setLimiteMes(data?.fatura?.limiteMes != null ? String(data.fatura.limiteMes) : "");
      setAjusteFatura(
        data?.fatura?.ajusteFatura != null ? String(data.fatura.ajusteFatura) : "0",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cartaoId, mes, ano]);

  const resumo = useMemo(() => {
    if (!det?.fatura) return null;
    return {
      limiteVigente: Number(det.fatura.limiteVigente || 0),
      valorFatura: Number(det.fatura.valorFatura || 0),
      emAberto: Number(det.fatura.emAberto || 0),
      totalPago: Number(det.fatura.totalPago || 0),
      disponivel: Number(det.fatura.limiteDisponivel || 0),
    };
  }, [det]);

  async function salvarAjustes() {
    if (!cartaoId) return;

    const payload: any = { mes, ano };

    // limiteMes pode ser vazio => null (volta pro fallback automático)
    if (limiteMes.trim() === "") payload.limiteMes = null;
    else payload.limiteMes = Number(limiteMes);

    if (ajusteFatura.trim() === "") payload.ajusteFatura = 0;
    else payload.ajusteFatura = Number(ajusteFatura);

    if (Number.isNaN(payload.limiteMes) && payload.limiteMes !== null) {
      alert("Limite do mês inválido.");
      return;
    }
    if (Number.isNaN(payload.ajusteFatura)) {
      alert("Ajuste da fatura inválido.");
      return;
    }

    try {
      setSavingAjustes(true);
      await api.patch(`/cartoes/${cartaoId}/fatura`, payload);
      await carregar();
      onChanged?.();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar ajustes do mês.");
    } finally {
      setSavingAjustes(false);
    }
  }

  function resetLancForm() {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    setLancForm({ descricao: "", data: `${yyyy}-${mm}-${dd}`, valor: "" });
  }

  async function salvarLancamento() {
    if (!cartaoId || !openLanc) return;

    if (!lancForm.data) {
      alert("Informe a data.");
      return;
    }
    if (!lancForm.valor || Number(lancForm.valor) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    const payload = {
      mes,
      ano,
      tipo: openLanc,
      descricao: lancForm.descricao?.trim() || null,
      data: lancForm.data,
      valor: Number(lancForm.valor),
    };

    try {
      setSavingLanc(true);
      await api.post(`/cartoes/${cartaoId}/lancamentos`, payload);
      setOpenLanc(null);
      await carregar();
      onChanged?.();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar lançamento.");
    } finally {
      setSavingLanc(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {det?.cartao?.nome ?? "Cartão"} • {String(mes).padStart(2, "0")}/{ano}
            </SheetTitle>
            {det?.cartao && (
              <p className="text-sm text-muted-foreground mt-1">
                Fechamento: {det.cartao.diaFechamento ?? "-"} • Vencimento:{" "}
                {det.cartao.diaVencimento ?? "-"}
              </p>
            )}
          </SheetHeader>

          {loading || !resumo ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {/* resumo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard size={16} /> Limite vigente
                  </div>
                  <div className="text-lg font-semibold mt-2">{formatBRL(resumo.limiteVigente)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (base: {formatBRL(Number(det.cartao?.limiteBase || 0))})
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet size={16} /> Disponível
                  </div>
                  <div className="text-lg font-semibold mt-2">{formatBRL(resumo.disponivel)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Em aberto: {formatBRL(resumo.emAberto)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Fatura do mês</p>
                    <p className="text-xs text-muted-foreground">
                      Compras + ajuste − pagamentos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total compras</p>
                    <p className="font-semibold">{formatBRL(Number(det.fatura.totalCompras || 0))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Ajuste</p>
                    <p className="font-medium mt-1">{formatBRL(Number(det.fatura.ajusteFatura || 0))}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="font-medium mt-1">{formatBRL(Number(det.fatura.totalPago || 0))}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Valor fatura</p>
                    <p className="font-medium mt-1">{formatBRL(Number(det.fatura.valorFatura || 0))}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Em aberto</p>
                    <p className="font-semibold mt-1">{formatBRL(Number(det.fatura.emAberto || 0))}</p>
                  </div>
                </div>
              </div>

              {/* ajustes do mês */}
              <div className="rounded-2xl border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Ajustes do mês</p>
                    <p className="text-xs text-muted-foreground">
                      Defina limite do mês (snapshot) e ajuste manual da fatura.
                    </p>
                  </div>
                  <Button onClick={salvarAjustes} disabled={savingAjustes} className="gap-2">
                    <Save size={16} /> {savingAjustes ? "Salvando..." : "Salvar"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label>Limite do mês (opcional)</Label>
                    <Input
                      type="number"
                      value={limiteMes}
                      onChange={(e) => setLimiteMes(e.target.value)}
                      placeholder="Vazio = automático"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se vazio, usa o último limite definido anteriormente ou o limite base.
                    </p>
                  </div>

                  <div>
                    <Label>Ajuste da fatura</Label>
                    <Input
                      type="number"
                      value={ajusteFatura}
                      onChange={(e) => setAjusteFatura(e.target.value)}
                      placeholder="Ex: 0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use para correções pontuais do mês sem perder lançamentos.
                    </p>
                  </div>
                </div>
              </div>

              {/* ações */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    resetLancForm();
                    setOpenLanc("COMPRA");
                  }}
                >
                  <Plus size={16} /> Adicionar compra
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    resetLancForm();
                    setOpenLanc("PAGAMENTO");
                  }}
                >
                  <Wallet size={16} /> Registrar pagamento
                </Button>
              </div>

              {/* lançamentos */}
              <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Lançamentos</p>
                  <p className="text-xs text-muted-foreground">
                    {det?.lancamentos?.length ?? 0} itens
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {(det?.lancamentos ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma compra/pagamento registrado neste mês.
                    </p>
                  ) : (
                    det.lancamentos.map((l: any) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between rounded-xl border bg-muted/10 p-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                l.tipo === "PAGAMENTO"
                                  ? "bg-primary/10"
                                  : "bg-muted/30"
                              }`}
                            >
                              {l.tipo}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {l.descricao || (l.tipo === "COMPRA" ? "Compra" : "Pagamento")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{l.data}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatBRL(Number(l.valor || 0))}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog simples para compra/pagamento */}
      <DialogLancamento
        open={!!openLanc}
        setOpen={(v: any) => setOpenLanc(v ? openLanc : null)}
        tipo={openLanc}
        form={lancForm}
        setForm={setLancForm}
        saving={savingLanc}
        onSave={salvarLancamento}
      />
    </>
  );
}

function DialogLancamento({
  open,
  setOpen,
  tipo,
  form,
  setForm,
  saving,
  onSave,
}: any) {
  if (!tipo) return null;

  const titulo = tipo === "COMPRA" ? "Adicionar compra" : "Registrar pagamento";

  return (
    <div>
      {/* reuse do seu Dialog */}
      <div className="hidden" />
      {/* Importando o Dialog do shadcn (mesmo do seu CartoesDialog) */}
      {/* Como você já tem o Dialog, use diretamente aqui */}
      {/* Para não duplicar imports, mantive simples com JSX inline */}
      {/* Você pode mover para um arquivo próprio depois */}

      {/* @ts-ignore */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* @ts-ignore */}
        <DialogContent className="sm:max-w-md w-[95%] rounded-2xl">
          {/* @ts-ignore */}
          <DialogHeader>
            {/* @ts-ignore */}
            <DialogTitle>{titulo}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder={tipo === "COMPRA" ? "Ex: Mercado, Shopee..." : "Ex: Pagamento fatura"}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="Ex: 120.50"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {tipo === "PAGAMENTO"
                ? "Pagamentos reduzem o valor em aberto e liberam limite automaticamente."
                : "Compras entram na fatura do mês selecionado."}
            </p>
          </div>

          {/* @ts-ignore */}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
