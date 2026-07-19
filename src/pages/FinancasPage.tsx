import { FinancaDialog } from "@/components/financas/FinancaDialog";
import { FinancasTable } from "@/components/financas/FinancasTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataLocalISO, venceHoje } from "@/lib/financasDia";
import { ArrowDownCircle, ArrowUpCircle, Download, Filter, PlusCircle, Scale, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import api, { financasApi } from "../services/api";

type TipoFinanca = "RENDA" | "DESPESA";

function normalizarData(valor?: string | Date | null) {
  if (!valor) return "";
  if (valor instanceof Date) return dataLocalISO(valor);

  const texto = String(valor);

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return texto.slice(0, 10);
  }

  const dataBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (dataBR) {
    return `${dataBR[3]}-${dataBR[2]}-${dataBR[1]}`;
  }

  const data = new Date(texto);

  return Number.isNaN(data.getTime()) ? "" : dataLocalISO(data);
}

export default function FinancasPage() {
  const [tipo, setTipo] = useState<TipoFinanca>("RENDA");
  const [financas, setFinancas] = useState<any[]>([]);
  const [resumoDia, setResumoDia] = useState({ rendas: 0, despesas: 0, saldoAcumulado: 0 });
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

  async function buscarResumoDia(inicio = "", fim = "") {
    const agora = new Date();
    const temIntervalo = Boolean(inicio || fim);
    const params = {
      mes: temIntervalo ? (inicio ? Number(inicio.slice(5, 7)) : mes) : agora.getMonth() + 1,
      ano: temIntervalo ? (inicio ? Number(inicio.slice(0, 4)) : ano) : agora.getFullYear(),
    };
    const [respostaRendas, respostaDespesas, respostaEstatisticas] = await Promise.all([
      api.get("/financas/tipo/RENDA", { params }),
      api.get("/financas/tipo/DESPESA", { params }),
      api.get("/financas/estatisticas/mensal", { params }),
    ]);

    const dentroDoIntervalo = (item: any) => {
      const data = normalizarData(item.dataInicio);

      if (!data) return false;

      const atendeInicio = !inicio || data >= inicio;
      const atendeFim = !fim || data <= fim;

      return atendeInicio && atendeFim;
    };
    const somarIntervalo = (itens: any[]) =>
      itens
        .filter(dentroDoIntervalo)
        .reduce((total, item) => total + Number(item.valor || 0), 0);
    const somarHoje = (itens: any[]) =>
      itens
        .filter((item) => venceHoje(item, agora))
        .reduce((total, item) => total + Number(item.valor || 0), 0);

    const dataHoje = dataLocalISO(agora);
    const dataSaldoAcumulado = temIntervalo ? fim || inicio : dataHoje;
    const dataItem = (item: any) => normalizarData(item.dataInicio);
    const somarAteDataSaldo = (itens: any[]) =>
      itens
        .filter((item) => {
          const data = dataItem(item);

          return data && data <= dataSaldoAcumulado;
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0);
    const somarAntesDaDataSaldo = (itens: any[]) =>
      itens
        .filter((item) => {
          const data = dataItem(item);

          return data && data < dataSaldoAcumulado;
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0);
    const rendasAteDataSaldo = somarAteDataSaldo(respostaRendas.data);
    const despesasAntesDaDataSaldo = somarAntesDaDataSaldo(respostaDespesas.data);
    const saldoAnterior = Number(respostaEstatisticas.data?.saldoAnterior || 0);

    setResumoDia({
      rendas: temIntervalo ? somarIntervalo(respostaRendas.data) : somarHoje(respostaRendas.data),
      despesas: temIntervalo ? somarIntervalo(respostaDespesas.data) : somarHoje(respostaDespesas.data),
      saldoAcumulado: saldoAnterior + rendasAteDataSaldo - despesasAntesDaDataSaldo,
    });
  }

  async function atualizarTela() {
    await Promise.all([buscarFinancas(), buscarResumoDia()]);
  }

  async function filtrar() {
    await Promise.all([buscarFinancas(), buscarResumoDia(dataInicio, dataFim)]);
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

  useEffect(() => {
    buscarResumoDia();
  }, []);

  useEffect(() => {
    if (dataInicio || dataFim) {
      buscarResumoDia(dataInicio, dataFim);
    }
  }, [dataInicio, dataFim, mes, ano, categoriaId]);

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

    const data = normalizarData(financa.dataInicio);

    const atendeInicio = !dataInicio || data >= dataInicio;
    const atendeFim = !dataFim || data <= dataFim;

    return atendeInicio && atendeFim;
  });
  const temFiltroData = Boolean(dataInicio || dataFim);
  const labelsResumo = temFiltroData
    ? {
        rendas: "Rendas do período",
        gastos: "Gastos do período",
        diferencaDia: "Diferença do período",
        saldo: "Saldo acumulado no período",
        diferencaTotal: "Diferença total do período",
      }
    : {
        rendas: "Rendas do dia",
        gastos: "Gastos do dia",
        diferencaDia: "Diferença do dia",
        saldo: "Saldo acumulado",
        diferencaTotal: "Diferença total",
      };

  async function limparFiltros() {
    const hoje = new Date();

    setMes(hoje.getMonth() + 1);
    setAno(hoje.getFullYear());
    setCategoriaId("");
    setDataInicio("");
    setDataFim("");
    await Promise.all([buscarFinancas(), buscarResumoDia()]);
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">{labelsResumo.rendas}</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-700">
            {formatarMoeda(resumoDia.rendas)}
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">{labelsResumo.gastos}</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-700">
            {formatarMoeda(resumoDia.despesas)}
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">{labelsResumo.diferencaDia}</CardTitle>
            <Scale className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className={`text-2xl font-bold ${resumoDia.rendas - resumoDia.despesas < 0 ? "text-red-700" : "text-blue-700"}`}>
            {formatarMoeda(resumoDia.rendas - resumoDia.despesas)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-teal-200 bg-teal-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">{labelsResumo.saldo}</CardTitle>
            <WalletCards className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent className={`text-2xl font-bold ${resumoDia.saldoAcumulado < 0 ? "text-red-700" : "text-teal-700"}`}>
            {formatarMoeda(resumoDia.saldoAcumulado)}
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">{labelsResumo.gastos}</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-700">
            {formatarMoeda(resumoDia.despesas)}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">{labelsResumo.diferencaTotal}</CardTitle>
            <Scale className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent className={`text-2xl font-bold ${resumoDia.saldoAcumulado - resumoDia.despesas < 0 ? "text-red-700" : "text-slate-700"}`}>
            {formatarMoeda(resumoDia.saldoAcumulado - resumoDia.despesas)}
          </CardContent>
        </Card>
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
            onClick={filtrar}
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
            onRefresh={atualizarTela}
          />
        </TabsContent>

        <TabsContent value="DESPESA">
          <FinancasTable
            financas={financasFiltradas}
            tipo="DESPESA"
            onRefresh={atualizarTela}
          />
        </TabsContent>
      </Tabs>

      <FinancaDialog
        open={open}
        setOpen={setOpen}
        tipo={tipo}
        onSave={atualizarTela}
      />
    </div>
  );
}
