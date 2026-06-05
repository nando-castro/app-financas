import { RegraPercentualDialog } from "@/components/financas/RegraPercentualDialog";
import { Button } from "@/components/ui/button";
import { regrasPercentuaisApi } from "@/services/api";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function RegrasPercentuaisPage() {
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  async function buscar() {
    try {
      setLoading(true);

      const { data } = await regrasPercentuaisApi.listar();

      setRegras(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  async function remover(id: number) {
    if (!window.confirm("Deseja remover a regra?")) {
      return;
    }

    await regrasPercentuaisApi.remover(id);

    buscar();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Regras Percentuais</h1>

          <p className="text-sm text-muted-foreground">
            Automatize valores com base em suas rendas.
          </p>
        </div>

        <Button onClick={() => setOpenDialog(true)}>Nova Regra</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {regras.map((regra: any) => (
          <div key={regra.id} className="rounded-2xl border p-4 bg-background">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{regra.nome}</p>

                <p className="text-xs text-muted-foreground">
                  {regra.percentual}%
                </p>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(regra);
                    setOpenDialog(true);
                  }}
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remover(regra.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Base</p>

                <p className="font-medium">
                  {regra.basePercentual === "TOTAL_RENDAS"
                    ? "Total das rendas"
                    : regra.categoria?.nome}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Valor Base</p>

                <p className="font-medium">{formatBRL(regra.valorBase)}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Valor Calculado</p>

                <p className="font-bold text-emerald-600">
                  {formatBRL(regra.valorCalculado)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RegraPercentualDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onSave={buscar}
        initialData={editing}
      />
    </div>
  );
}
