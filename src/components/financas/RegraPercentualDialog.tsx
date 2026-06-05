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
import { categoriasApi, regrasPercentuaisApi } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

type Categoria = {
  id: number;
  nome: string;
};

type RegraPercentualDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSave: () => void;
  initialData?: {
    id?: number;
    nome?: string;
    percentual?: number;
    basePercentual?: string;

    mesReferencia?: number;
    anoReferencia?: number;

    dataInicio?: string;
    dataFim?: string;

    categoria?: {
      id: number;
      nome: string;
    };
  } | null;
};

export function RegraPercentualDialog({
  open,
  setOpen,
  onSave,
  initialData,
}: RegraPercentualDialogProps) {
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [percentual, setPercentual] = useState("");
  const [basePercentual, setBasePercentual] = useState("TOTAL_RENDAS");

  const [categoriaId, setCategoriaId] = useState<string | undefined>();

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [tipoVigencia, setTipoVigencia] = useState<"TODOS" | "MES" | "PERIODO">(
    "TODOS",
  );

  const [mesReferencia, setMesReferencia] = useState("");
  const [anoReferencia, setAnoReferencia] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const isEdit = useMemo(() => Boolean(initialData?.id), [initialData?.id]);

  useEffect(() => {
    if (!open) return;

    carregarCategorias();

    setNome(initialData?.nome ?? "");

    setPercentual(
      initialData?.percentual !== undefined
        ? String(initialData.percentual)
        : "",
    );

    setBasePercentual(initialData?.basePercentual ?? "TOTAL_RENDAS");

    setCategoriaId(
      initialData?.categoria?.id ? String(initialData.categoria.id) : undefined,
    );

    if (initialData?.mesReferencia) {
      setTipoVigencia("MES");
      setMesReferencia(String(initialData.mesReferencia));
      setAnoReferencia(String(initialData.anoReferencia));
    } else if (initialData?.dataInicio) {
      setTipoVigencia("PERIODO");
      setDataInicio(initialData.dataInicio.slice(0, 10));
      setDataFim(initialData.dataFim?.slice(0, 10) ?? "");
    } else {
      setTipoVigencia("TODOS");
    }
  }, [open, initialData]);

  async function carregarCategorias() {
    try {
      const { data } = await categoriasApi.buscarPorTipo("RENDA");
      setCategorias(data);
    } catch {
      setCategorias([]);
    }
  }

  function limpar() {
    setNome("");
    setPercentual("");
    setBasePercentual("TOTAL_RENDAS");
    setCategoriaId(undefined);

    setTipoVigencia("TODOS");
    setMesReferencia("");
    setAnoReferencia("");

    setDataInicio("");
    setDataFim("");
  }

  async function salvar() {
    try {
      setSaving(true);

      const payload: any = {
        nome: nome.trim(),
        percentual: Number(percentual),
        basePercentual,
      };

      if (basePercentual === "CATEGORIA_RENDA" && categoriaId) {
        payload.categoriaId = Number(categoriaId);
      }

      if (tipoVigencia === "MES") {
        payload.mesReferencia = Number(mesReferencia);
        payload.anoReferencia = Number(anoReferencia);
        payload.dataInicio = undefined;
        payload.dataFim = undefined;
      }

      if (tipoVigencia === "PERIODO") {
        payload.dataInicio = dataInicio;
        payload.dataFim = dataFim;
        payload.mesReferencia = undefined;
        payload.anoReferencia = undefined;
      }

      if (tipoVigencia === "TODOS") {
        payload.mesReferencia = undefined;
        payload.anoReferencia = undefined;
        payload.dataInicio = undefined;
        payload.dataFim = undefined;
      }

      if (isEdit && initialData?.id) {
        await regrasPercentuaisApi.atualizar(initialData.id, payload);
      } else {
        await regrasPercentuaisApi.criar(payload);
      }

      onSave();
      setOpen(false);
      limpar();
    } finally {
      setSaving(false);
    }
  }

  const disabled =
    !nome.trim() ||
    !percentual ||
    Number(percentual) <= 0 ||
    (basePercentual === "CATEGORIA_RENDA" && !categoriaId) ||
    (tipoVigencia === "MES" && (!mesReferencia || !anoReferencia)) ||
    (tipoVigencia === "PERIODO" && (!dataInicio || !dataFim));

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          limpar();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Regra Percentual" : "Nova Regra Percentual"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Nome</Label>

            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Reserva de Emergência"
            />
          </div>

          <div className="grid gap-2">
            <Label>Percentual (%)</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="grid gap-2">
            <Label>Base do cálculo</Label>

            <div className="grid gap-2">
              <Label>Vigência</Label>

              <Select
                value={tipoVigencia}
                onValueChange={(v: any) => setTipoVigencia(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="TODOS">Todos os meses</SelectItem>

                  <SelectItem value="MES">Mês específico</SelectItem>

                  <SelectItem value="PERIODO">Intervalo de datas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoVigencia === "MES" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Mês</Label>

                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={mesReferencia}
                    onChange={(e) => setMesReferencia(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Ano</Label>

                  <Input
                    type="number"
                    value={anoReferencia}
                    onChange={(e) => setAnoReferencia(e.target.value)}
                  />
                </div>
              </div>
            )}

            {tipoVigencia === "PERIODO" && (
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label>Data inicial</Label>

                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Data final</Label>

                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Select value={basePercentual} onValueChange={setBasePercentual}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="TOTAL_RENDAS">Total das rendas</SelectItem>

                <SelectItem value="CATEGORIA_RENDA">
                  Categoria de renda
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {basePercentual === "CATEGORIA_RENDA" && (
            <div className="grid gap-2">
              <Label>Categoria</Label>

              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>

                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={String(categoria.id)}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>

          <Button onClick={salvar} disabled={disabled || saving}>
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
