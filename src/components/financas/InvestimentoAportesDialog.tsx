import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { investimentosApi } from "@/services/api";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type InvestimentoAporteItem = {
  id: number;
  investimentoId: number;
  valorMensal: number | string;
  dataInicio: string;
  dataFim: string | null;
};

type InvestimentoAportesDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  investimentoId: number | null;
  onChanged: () => void;
};

function formatBRL(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDateBR(date: string | null) {
  if (!date) return "Em aberto";
  const [ano, mes, dia] = date.split("-");
  return `${dia}/${mes}/${ano}`;
}

function isFutureDate(date: string) {
  const hoje = new Date();
  const hojeISO = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
  return date > hojeISO;
}

export function InvestimentoAportesDialog({
  open,
  setOpen,
  investimentoId,
  onChanged,
}: InvestimentoAportesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvestimentoAporteItem[]>([]);

  async function carregar() {
    if (!investimentoId) return;

    try {
      setLoading(true);
      const { data } = await investimentosApi.listarAportes(investimentoId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function remover(aporteId: number) {
    if (!investimentoId) return;

    await investimentosApi.removerAporteProgramado(investimentoId, aporteId);
    await carregar();
    onChanged();
  }

  useEffect(() => {
    if (open && investimentoId) {
      carregar();
    }
  }, [open, investimentoId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de aportes</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
          {loading ? (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
              Carregando aportes...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
              Nenhum aporte registrado para este investimento.
            </div>
          ) : (
            items.map((item) => {
              const podeRemover = isFutureDate(item.dataInicio);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-background p-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{formatBRL(item.valorMensal)} / mês</p>
                    <p className="text-sm text-muted-foreground">
                      Início: {formatDateBR(item.dataInicio)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fim: {formatDateBR(item.dataFim)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.dataFim ? "Encerrado" : "Ativo ou programado"}
                    </p>
                  </div>

                  {podeRemover ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => remover(item.id)}
                    >
                      <Trash2 size={14} />
                      Remover futuro
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}