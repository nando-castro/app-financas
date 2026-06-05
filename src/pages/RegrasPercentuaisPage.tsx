import { RegraPercentualDialog } from "@/components/financas/RegraPercentualDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { regrasPercentuaisApi } from "@/services/api";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatarVigencia(regra: any) {
  if (regra.mesReferencia && regra.anoReferencia) {
    return `${String(regra.mesReferencia).padStart(2, "0")}/${regra.anoReferencia}`;
  }

  if (regra.dataInicio) {
    const inicio = new Date(regra.dataInicio).toLocaleDateString("pt-BR");
    const fim = regra.dataFim
      ? new Date(regra.dataFim).toLocaleDateString("pt-BR")
      : "-";
    return `${inicio} até ${fim}`;
  }

  return "Todos os meses";
}

export default function RegrasPercentuaisPage() {
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  async function buscar() {
    try {
      setLoading(true);
      const { data } = await regrasPercentuaisApi.listar(mes, ano);
      setRegras(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, [mes, ano]);

  async function remover(id: number) {
    if (!window.confirm("Deseja remover a regra?")) return;
    await regrasPercentuaisApi.remover(id);
    buscar();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Regras Percentuais</h1>
          <p className="text-sm text-muted-foreground">
            Automatize valores com base em suas rendas.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          Nova Regra
        </Button>
      </div>

      {/* Filtros */}
      {/* Desktop */}
      <div className="hidden md:flex gap-3 items-end">
        <div>
          <label className="text-sm text-muted-foreground">Mês</label>
          <Input
            type="number"
            min={1}
            max={12}
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="w-20"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Ano</label>
          <Input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="w-28"
          />
        </div>

        <Button variant="outline" onClick={buscar}>
          Atualizar
        </Button>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden gap-2 w-full">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border rounded-md px-3 py-2 flex-1 bg-background text-sm"
        >
          {[
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
          ].map((nome, index) => (
            <option key={index} value={index + 1}>
              {nome}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="border rounded-md px-3 py-2 flex-1 bg-background text-sm"
        >
          {Array.from(
            { length: 6 },
            (_, i) => new Date().getFullYear() - 2 + i,
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* ✅ Botão Atualizar também no mobile */}
        <Button variant="outline" onClick={buscar} className="shrink-0">
          Atualizar
        </Button>
      </div>

      {/* Estado de carregamento / vazio */}
      {loading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {!loading && regras.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <p className="text-sm">Nenhuma regra cadastrada para este período.</p>
          <Button
            variant="outline"
            onClick={() => {
              setEditing(null);
              setOpenDialog(true);
            }}
          >
            Criar primeira regra
          </Button>
        </div>
      )}

      {/* Grid de cards */}
      {!loading && regras.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {regras.map((regra: any) => (
            <div
              key={regra.id}
              className="rounded-2xl border p-4 bg-background"
            >
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
                  <p className="text-xs text-muted-foreground">Vigência</p>
                  <p className="font-medium">{formatarVigencia(regra)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Valor Base</p>
                  <p className="font-medium">{formatBRL(regra.valorBase)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Valor Calculado
                  </p>
                  <p className="font-bold text-emerald-600">
                    {formatBRL(regra.valorCalculado)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegraPercentualDialog
        open={openDialog}
        setOpen={(value) => {
          setOpenDialog(value);
          if (!value) setEditing(null); // ✅ Limpa editing ao fechar
        }}
        onSave={buscar}
        initialData={editing}
      />
    </div>
  );
}
