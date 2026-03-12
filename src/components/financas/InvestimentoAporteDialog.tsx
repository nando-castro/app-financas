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
import { useEffect, useState } from "react";

type InvestimentoAporteDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSave: () => void;
  investimentoId: number | null;
  mode: "alterar" | "parar";
};

export function InvestimentoAporteDialog({
  open,
  setOpen,
  onSave,
  investimentoId,
  mode,
}: InvestimentoAporteDialogProps) {
  const [saving, setSaving] = useState(false);
  const [valorMensal, setValorMensal] = useState("");
  const [dataReferencia, setDataReferencia] = useState("");

  useEffect(() => {
    if (open) {
      setValorMensal("");
      setDataReferencia("");
    }
  }, [open, mode]);

  async function salvar() {
    if (!investimentoId) return;

    try {
      setSaving(true);

      if (mode === "alterar") {
        await investimentosApi.alterarAporte(investimentoId, {
          valorMensal: Number(valorMensal),
          dataInicio: dataReferencia,
        });
      } else {
        await investimentosApi.pararAporte(investimentoId, {
          dataParada: dataReferencia,
        });
      }

      onSave();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const disabled =
    mode === "alterar"
      ? !dataReferencia || valorMensal === "" || Number(valorMensal) < 0
      : !dataReferencia;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "alterar" ? "Alterar aporte mensal" : "Parar aporte mensal"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {mode === "alterar" && (
            <div className="grid gap-2">
              <Label htmlFor="valorMensal">Novo valor mensal</Label>
              <Input
                id="valorMensal"
                type="number"
                min="0"
                step="0.01"
                value={valorMensal}
                onChange={(e) => setValorMensal(e.target.value)}
                placeholder="1000"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="dataReferencia">
              {mode === "alterar" ? "Aplicar a partir de" : "Parar a partir de"}
            </Label>
            <Input
              id="dataReferencia"
              type="date"
              value={dataReferencia}
              onChange={(e) => setDataReferencia(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              O backend usa a competência do mês para atualizar o histórico.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={disabled || saving}>
            {saving
              ? "Salvando..."
              : mode === "alterar"
                ? "Salvar aporte"
                : "Parar aporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}