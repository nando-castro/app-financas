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
import { investimentosApi } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

type InvestimentoDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSave: () => void;
  initialData?: {
    id?: number;
    nome?: string;
    valorInicial?: number;
    taxaMensal?: number;
    aporteMensal?: number;
    dataInicio?: string;
  } | null;
};

export function InvestimentoDialog({
  open,
  setOpen,
  onSave,
  initialData,
}: InvestimentoDialogProps) {
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [aporteMensal, setAporteMensal] = useState("");
  const [dataInicio, setDataInicio] = useState("");

  const isEdit = useMemo(() => Boolean(initialData?.id), [initialData?.id]);

  useEffect(() => {
    if (open) {
      setNome(initialData?.nome ?? "");
      setValorInicial(
        initialData?.valorInicial !== undefined
          ? String(initialData.valorInicial)
          : "",
      );
      setTaxaMensal(
        initialData?.taxaMensal !== undefined
          ? String(initialData.taxaMensal)
          : "",
      );
      setAporteMensal(
        initialData?.aporteMensal !== undefined
          ? String(initialData.aporteMensal)
          : "",
      );
      setDataInicio(initialData?.dataInicio?.slice(0, 10) ?? "");
    }
  }, [open, initialData]);

  function limpar() {
    setNome("");
    setValorInicial("");
    setTaxaMensal("");
    setAporteMensal("");
    setDataInicio("");
  }

  async function salvar() {
    try {
      setSaving(true);

      if (isEdit && initialData?.id) {
        await investimentosApi.update(initialData.id, {
          nome: nome.trim(),
          valorInicial: Number(valorInicial),
          taxaMensal: Number(taxaMensal),
          dataInicio,
        });
      } else {
        await investimentosApi.create({
          nome: nome.trim(),
          valorInicial: Number(valorInicial),
          taxaMensal: Number(taxaMensal),
          aporteMensal: aporteMensal ? Number(aporteMensal) : 0,
          dataInicio,
        });
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
    !valorInicial ||
    Number(valorInicial) <= 0 ||
    taxaMensal === "" ||
    Number(taxaMensal) < 0 ||
    !dataInicio;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) limpar();
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar investimento" : "Novo investimento"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do investimento</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: CDB, Tesouro, Reserva"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="valorInicial">Valor investido</Label>
            <Input
              id="valorInicial"
              type="number"
              min="0"
              step="0.01"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              placeholder="1000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taxaMensal">Rendimento mensal (%)</Label>
            <Input
              id="taxaMensal"
              type="number"
              min="0"
              step="0.01"
              value={taxaMensal}
              onChange={(e) => setTaxaMensal(e.target.value)}
              placeholder="1"
            />
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="aporteMensal">Aporte inicial (opcional)</Label>
              <Input
                id="aporteMensal"
                type="number"
                min="0"
                step="0.01"
                value={aporteMensal}
                onChange={(e) => setAporteMensal(e.target.value)}
                placeholder="200"
              />
              <p className="text-xs text-muted-foreground">
                Depois de criado, os aportes passam a ser gerenciados pelo
                histórico.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="dataInicio">Data do investimento</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
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
