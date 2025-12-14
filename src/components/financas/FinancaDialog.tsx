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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO";

export function FinancaDialog({
  open,
  setOpen,
  tipo,
  onSave,
  initialData,
}: any) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Única
  const [unica, setUnica] = useState(false);

  // Criar um para cada mês até a data fim
  const [repetirAteDataFim, setRepetirAteDataFim] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    valor: "",
    dataInicio: "",
    dataFim: "",
    parcelas: "",
    categoriaId: "",
    formaPagamento: "PIX" as FormaPagamento,
    cartaoId: "",
  });

  const isEditing = !!initialData?.id;

  const isDespesa = tipo === "DESPESA";
  const isCartao = isDespesa && form.formaPagamento === "CARTAO";

  const canShowPagamento = isDespesa; // forma de pagamento só faz sentido para despesa (ajuste se quiser para renda também)

  const cartaoLabel = useMemo(() => {
    const c = cartoes.find((x) => String(x.id) === String(form.cartaoId));
    return c?.nome ?? "";
  }, [cartoes, form.cartaoId]);

  useEffect(() => {
    if (open) {
      carregarCategorias();
      if (canShowPagamento) carregarCartoes();

      if (initialData) {
        const di = initialData.dataInicio?.split("T")[0] || "";
        const df = initialData.dataFim?.split("T")[0] || "";

        setForm({
          nome: initialData.nome || "",
          valor: String(initialData.valor) || "",
          dataInicio: di,
          dataFim: df,
          parcelas: initialData.parcelas ? String(initialData.parcelas) : "",
          categoriaId: initialData.categoria?.id
            ? String(initialData.categoria.id)
            : "",
          formaPagamento: (initialData.formaPagamento as FormaPagamento) || "PIX",
          cartaoId: initialData.cartaoId ? String(initialData.cartaoId) : "",
        });

        setUnica(!!di && di === df && !initialData.parcelas);
        setRepetirAteDataFim(false);
      } else {
        setForm({
          nome: "",
          valor: "",
          dataInicio: "",
          dataFim: "",
          parcelas: "",
          categoriaId: "",
          formaPagamento: "PIX",
          cartaoId: "",
        });
        setUnica(false);
        setRepetirAteDataFim(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Quando marcar Única
  useEffect(() => {
    if (!open) return;
    if (unica) {
      setForm((prev) => ({
        ...prev,
        dataFim: prev.dataInicio || "",
        parcelas: "",
      }));
    }
  }, [unica, open]);

  // Se dataInicio mudar e Única estiver marcada, mantém dataFim igual
  useEffect(() => {
    if (!open) return;
    if (unica) {
      setForm((prev) => ({
        ...prev,
        dataFim: prev.dataInicio || "",
      }));
    }
  }, [form.dataInicio, unica, open]);

  // Se trocar formaPagamento e não for cartão, limpa cartão
  useEffect(() => {
    if (!open) return;
    if (!isCartao && form.cartaoId) {
      setForm((prev) => ({ ...prev, cartaoId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formaPagamento, open]);

  async function carregarCategorias() {
    try {
      const { data } = await api.get("/categorias");
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarCartoes() {
    try {
      const { data } = await api.get("/cartoes");
      setCartoes(data);
    } catch (err) {
      console.error(err);
      setCartoes([]);
    }
  }

  // mode:
  // "single" -> salva normal
  // "next"   -> salva atual + próxima (apenas criação)
  // "range"  -> cria/atualiza um para cada mês até a data fim
  async function handleSave(mode: "single" | "next" | "range" = "single") {
    try {
      setLoading(true);

      // validações básicas
      if (!form.nome?.trim()) {
        alert("Informe o nome.");
        return;
      }
      if (!form.valor || Number(form.valor) <= 0) {
        alert("Informe um valor válido.");
        return;
      }
      if (!form.categoriaId) {
        alert("Selecione uma categoria.");
        return;
      }
      if (!form.dataInicio) {
        alert("Informe a data de início.");
        return;
      }

      // validação cartão (somente despesa)
      if (isCartao && !form.cartaoId) {
        alert("Selecione o cartão para pagamento.");
        return;
      }

      const dataInicioBase = form.dataInicio;
      const dataFimInput = unica ? form.dataInicio : form.dataFim || null;

      const parcelas =
        unica || repetirAteDataFim
          ? null
          : form.parcelas
          ? Number(form.parcelas)
          : null;

      const basePayload: any = {
        nome: form.nome,
        valor: Number(form.valor),
        dataInicio: dataInicioBase,
        dataFim: dataFimInput,
        parcelas,
        tipo,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      };

      // formaPagamento e cartaoId (somente se DESPESA)
      if (canShowPagamento) {
        basePayload.formaPagamento = form.formaPagamento;
        basePayload.cartaoId =
          form.formaPagamento === "CARTAO" && form.cartaoId
            ? Number(form.cartaoId)
            : null;
      }

      // RANGE: criar um por mês até data fim
      if (mode === "range") {
        if (!dataInicioBase || !form.dataFim) {
          alert(
            "Preencha a data inicial e a data final para repetir até a data fim."
          );
          return;
        }

        const start = dayjs(dataInicioBase);
        const end = dayjs(form.dataFim);

        if (!start.isValid() || !end.isValid()) {
          alert("Datas inválidas.");
          return;
        }

        if (end.isBefore(start, "day")) {
          alert("A data final deve ser maior ou igual à data inicial.");
          return;
        }

        let current = start.clone();
        let isFirst = true;

        while (current.isBefore(end, "month") || current.isSame(end, "month")) {
          const di = current.format("YYYY-MM-DD");

          const payloadItem = {
            ...basePayload,
            dataInicio: di,
            dataFim: di, // sempre igual ao início
            parcelas: null,
          };

          if (isFirst && isEditing && initialData?.id) {
            await api.put(`/financas/${initialData.id}`, payloadItem);
          } else {
            await api.post("/financas", payloadItem);
          }

          isFirst = false;
          current = current.add(1, "month");
        }
      } else {
        // SINGLE / NEXT
        if (isEditing && initialData?.id) {
          await api.put(`/financas/${initialData.id}`, basePayload);
        } else {
          await api.post("/financas", basePayload);

          // Criar também para o próximo mês (apenas criação)
          if (mode === "next" && dataInicioBase) {
            const nextDataInicio = dayjs(dataInicioBase)
              .add(1, "month")
              .format("YYYY-MM-DD");

            const nextDataFim = dataFimInput
              ? dayjs(dataFimInput).add(1, "month").format("YYYY-MM-DD")
              : null;

            const payloadNext = {
              ...basePayload,
              dataInicio: nextDataInicio,
              dataFim: nextDataFim,
            };

            await api.post("/financas", payloadNext);
          }
        }
      }

      onSave();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar finança");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md w-[95%] rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Editar ${tipo === "RENDA" ? "Renda" : "Despesa"}`
              : `Adicionar ${tipo === "RENDA" ? "Renda" : "Despesa"}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Nome */}
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Salário, Conta de Luz..."
            />
          </div>

          {/* Valor */}
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="Ex: 1500.00"
            />
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria</Label>
            <Select
              value={form.categoriaId}
              onValueChange={(v) => setForm({ ...form, categoriaId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forma de pagamento (somente DESPESA) */}
          {canShowPagamento && (
            <div>
              <Label>Forma de pagamento</Label>
              <Select
                value={form.formaPagamento}
                onValueChange={(v: FormaPagamento) =>
                  setForm((prev) => ({ ...prev, formaPagamento: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO">Cartão</SelectItem>
                </SelectContent>
              </Select>

              {isCartao && (
                <>
                  <div className="mt-3">
                    <Label>Cartão</Label>
                    <Select
                      value={form.cartaoId}
                      onValueChange={(v) =>
                        setForm((prev) => ({ ...prev, cartaoId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        {cartoes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!!cartaoLabel && (
                      <p className="text-xs text-slate-500 mt-1">
                        Será lançado no cartão: <span className="font-medium">{cartaoLabel}</span>
                      </p>
                    )}

                    {!cartoes.length && (
                      <p className="text-xs text-slate-500 mt-1">
                        Nenhum cartão cadastrado. Cadastre um cartão na tela de cartões.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Única */}
          <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
            <input
              type="checkbox"
              checked={unica}
              onChange={(e) => setUnica(e.target.checked)}
              className="h-4 w-4 accent-slate-900"
            />
            <span>É única (Data fim = Data início)</span>
          </label>

          {/* Criar um para cada mês até a data fim */}
          <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
            <input
              type="checkbox"
              checked={repetirAteDataFim}
              onChange={(e) => setRepetirAteDataFim(e.target.checked)}
              className="h-4 w-4 accent-slate-900"
            />
            <span>Criar um para cada mês até a data fim</span>
          </label>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.dataInicio}
                onChange={(e) =>
                  setForm({ ...form, dataInicio: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Data Fim (opcional)</Label>
              <Input
                type="date"
                value={unica ? form.dataInicio : form.dataFim}
                onChange={(e) =>
                  setForm({ ...form, dataFim: e.target.value })
                }
                disabled={unica}
                className={unica ? "opacity-70" : ""}
              />
              {repetirAteDataFim && form.dataInicio && form.dataFim && (
                <p className="text-xs text-slate-500 mt-1">
                  Serão gerados lançamentos mensais de {form.dataInicio} até{" "}
                  {form.dataFim}, cada um com data fim igual à data início do
                  mês.
                  {isEditing
                    ? " O lançamento atual será o do primeiro mês; os demais serão criados."
                    : ""}
                </p>
              )}
            </div>
          </div>

          {/* Parcelas */}
          <div>
            <Label>Parcelas (opcional)</Label>
            <Input
              type="number"
              value={form.parcelas}
              onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
              placeholder="Ex: 12"
              disabled={unica || repetirAteDataFim}
              className={unica || repetirAteDataFim ? "opacity-70" : ""}
            />
            <p className="text-xs text-slate-500 mt-1">
              Se informar parcelas, a data fim será calculada automaticamente.
              {unica
                ? " (Desabilitado porque é única.)"
                : repetirAteDataFim
                ? " (Desabilitado porque será criada uma por mês até a data fim.)"
                : ""}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>

          {!isEditing && !repetirAteDataFim && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave("next")}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar e criar mês seguinte"}
            </Button>
          )}

          <Button
            onClick={() => handleSave(repetirAteDataFim ? "range" : "single")}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
