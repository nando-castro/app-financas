import { FinancaDialog } from "@/components/financas/FinancaDialog";
import { FinancasTable } from "@/components/financas/FinancasTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api, { financasApi } from "../services/api";

type TipoFinanca = "RENDA" | "DESPESA";

export default function FinancasPage() {
  const [tipo, setTipo] = useState<TipoFinanca>("RENDA");
  const [financas, setFinancas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [open, setOpen] = useState(false);

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function buscarFinancas() {
    const { data } = await api.get(`/financas/tipo/${tipo}`, {
      params: {
        mes,
        ano,
        categoriaId: categoriaId || undefined,
      },
    });

    setFinancas(data);
  }

  async function buscarCategorias() {
    try {
      const { data } = await api.get("/categorias", {
        params: {
          tipo,
        },
      });

      setCategorias(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  function handleTipoChange(value: string) {
    const novoTipo = value as TipoFinanca;

    setTipo(novoTipo);
    setCategoriaId("");
  }

  useEffect(() => {
    buscarCategorias();
  }, [tipo]);

  useEffect(() => {
    buscarFinancas();
  }, [tipo, mes, ano, categoriaId]);

  const meses = [
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
  ];

  const financasFiltradas = financas.filter((financa) => {
    if (!dataInicio && !dataFim) {
      return true;
    }

    const data = financa.dataInicio;

    const atendeInicio = !dataInicio || data >= dataInicio;
    const atendeFim = !dataFim || data <= dataFim;

    return atendeInicio && atendeFim;
  });

  function limparFiltros() {
    const hoje = new Date();

    setMes(hoje.getMonth() + 1);
    setAno(hoje.getFullYear());
    setCategoriaId("");
    setDataInicio("");
    setDataFim("");
  }

  async function gerarRelatorio() {
    try {
      const response = await financasApi.gerarRelatorio(mes, ano);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `relatorio-financeiro-${mes}-${ano}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Minhas Finanças</h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={gerarRelatorio}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Relatório
          </Button>

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Nova {tipo === "RENDA" ? "Renda" : "Despesa"}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border rounded-md px-3 py-2"
        >
          {meses.map((nome, index) => (
            <option key={index} value={index + 1}>
              {nome}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="border rounded-md px-3 py-2"
        >
          {Array.from({ length: 6 }, (_, i) => hoje.getFullYear() - 2 + i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ),
          )}
        </select>

        {/* Filtro de Categoria por tipo */}
        <select
          value={categoriaId}
          onChange={(e) =>
            setCategoriaId(e.target.value ? Number(e.target.value) : "")
          }
          className="border rounded-md px-3 py-2 min-w-[180px]"
        >
          <option value="">
            Todas as Categorias de {tipo === "RENDA" ? "Renda" : "Despesa"}
          </option>

          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span>De:</span>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <span>Até:</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={buscarFinancas}
          >
            <Filter size={16} /> Filtrar
          </Button>

          <Button variant="secondary" onClick={limparFiltros}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Abas de tipo */}
      <Tabs value={tipo} onValueChange={handleTipoChange}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="RENDA" className="w-1/2 md:w-auto">
            Rendas
          </TabsTrigger>

          <TabsTrigger value="DESPESA" className="w-1/2 md:w-auto">
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="RENDA">
          <FinancasTable
            financas={financasFiltradas}
            tipo="RENDA"
            onRefresh={buscarFinancas}
          />
        </TabsContent>

        <TabsContent value="DESPESA">
          <FinancasTable
            financas={financasFiltradas}
            tipo="DESPESA"
            onRefresh={buscarFinancas}
          />
        </TabsContent>
      </Tabs>

      <FinancaDialog
        open={open}
        setOpen={setOpen}
        tipo={tipo}
        onSave={buscarFinancas}
      />
    </div>
  );
}
