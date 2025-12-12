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
import { useEffect, useState } from "react";

export function FinancaDialog({
  open,
  setOpen,
  tipo,
  onSave,
  initialData,
}: any) {
  const [categorias, setCategorias] = useState<any[]>([]);
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
  });

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (open) {
      carregarCategorias();

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

  async function carregarCategorias() {
    try {
      const { data } = await api.get("/categorias");
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  // mode:
  // "single" -> salva normal
  // "next"   -> salva atual + próxima (apenas criação)
  // "range"  -> cria/atualiza um para cada mês até a data fim
  async function handleSave(mode: "single" | "next" | "range" = "single") {
    try {
      setLoading(true);

      const dataInicioBase = form.dataInicio;
      const dataFimInput = unica ? form.dataInicio : form.dataFim || null;
      const parcelas =
        unica || repetirAteDataFim
          ? null
          : form.parcelas
          ? Number(form.parcelas)
          : null;

      const basePayload = {
        nome: form.nome,
        valor: Number(form.valor),
        dataInicio: dataInicioBase,
        dataFim: dataFimInput,
        parcelas,
        tipo,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      };

      // RANGE: criar um por mês até data fim
      if (mode === "range") {
        if (!dataInicioBase || !form.dataFim) {
          alert("Preencha a data inicial e a data final para repetir até a data fim.");
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
            dataFim: di, // sempre igual ao início, como você pediu
            parcelas: null,
          };

          if (isFirst && isEditing && initialData?.id) {
            // Atualiza o registro atual para ser o primeiro mês
            await api.put(`/financas/${initialData.id}`, payloadItem);
          } else {
            // Cria novos registros para os meses seguintes
            await api.post("/financas", payloadItem);
          }

          isFirst = false;
          current = current.add(1, "month");
        }
      } else {
        // SINGLE / NEXT
        if (isEditing && initialData?.id) {
          // Edição simples
          await api.put(`/financas/${initialData.id}`, basePayload);
        } else {
          // Criação normal
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

          {/* Criar um para cada mês até a data fim (agora também na edição) */}
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

          {/* Salvar e criar mês seguinte – só para criação e quando não está em modo range */}
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

          {/* Salvar:
             - se repetirAteDataFim => "range"
             - senão => "single"
          */}
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
