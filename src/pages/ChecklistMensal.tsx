import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import dayjs from "dayjs";
import { Calendar, CheckCircle2, Circle, RefreshCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ChecklistItem = {
  financaId: number;
  nome: string;
  tipo: "RENDA" | "DESPESA";
  valor: number;
  categoriaId?: number | null;
  dataLancamento: string; // YYYY-MM-DD
  competencia: string; // YYYY-MM
  parcelas?: number | null;
  parcelaAtual?: number | null;
  checked: boolean;
  checkedAt?: string | null;
};

type ChecklistResponse = {
  mes: number;
  ano: number;
  itens: ChecklistItem[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function moneyBRL(v: number) {
  return `R$ ${Number(v || 0).toFixed(2)}`;
}

export default function ChecklistMensal() {
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  // alterações locais (bulk save)
  const [edits, setEdits] = useState<Record<number, boolean>>({});

  async function carregar(m: number, a: number) {
    setLoading(true);
    try {
      const { data } = await api.get(`/financas/checklist/mensal?mes=${m}&ano=${a}`);
      setData(data);
      setEdits({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar(mes, ano);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  const itens = useMemo(() => {
    const base = data?.itens ?? [];
    return base.map((it) => ({
      ...it,
      checked: edits[it.financaId] ?? it.checked,
    }));
  }, [data, edits]);

  const dirtyCount = useMemo(() => {
    if (!data) return 0;
    let c = 0;
    for (const it of data.itens) {
      const v = edits[it.financaId];
      if (v === undefined) continue;
      if (v !== it.checked) c++;
    }
    return c;
  }, [data, edits]);

  const resumo = useMemo(() => {
    let rendas = 0;
    let despesas = 0;
    let marcados = 0;

    for (const it of itens) {
      if (it.tipo === "RENDA") rendas += Number(it.valor) || 0;
      else despesas += Number(it.valor) || 0;
      if (it.checked) marcados++;
    }

    return { rendas, despesas, saldo: rendas - despesas, marcados, total: itens.length };
  }, [itens]);

  function mudarMes(e: React.ChangeEvent<HTMLSelectElement>) {
    setMes(Number(e.target.value));
  }

  function mudarAno(e: React.ChangeEvent<HTMLSelectElement>) {
    setAno(Number(e.target.value));
  }

  function toggle(financaId: number, current: boolean) {
    setEdits((prev) => ({ ...prev, [financaId]: !current }));
  }

  function desfazer() {
    setEdits({});
  }

  async function salvar() {
    if (!data) return;

    // envia só o que mudou
    const updates: { financaId: number; checked: boolean }[] = [];
    for (const it of data.itens) {
      const v = edits[it.financaId];
      if (v === undefined) continue;
      if (v !== it.checked) updates.push({ financaId: it.financaId, checked: v });
    }
    if (updates.length === 0) return;

    setSaving(true);
    try {
      await api.patch(`/financas/checklist/mensal/bulk`, { mes, ano, itens: updates });
      await carregar(mes, ano); // recarrega pra atualizar checkedAt real
    } finally {
      setSaving(false);
    }
  }

  const mesLabel = useMemo(
    () => dayjs().month(mes - 1).format("MMMM"),
    [mes],
  );

  if (!data) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Filtros + ações */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-600" size={18} />
          <select value={mes} onChange={mudarMes} className="border rounded-lg px-2 py-1 text-sm">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {dayjs().month(m - 1).format("MMMM")}
              </option>
            ))}
          </select>

          <select value={ano} onChange={mudarAno} className="border rounded-lg px-2 py-1 text-sm">
            {Array.from({ length: 6 }, (_, i) => 2022 + i).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => carregar(mes, ano)}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw size={16} />
            Recarregar
          </button>

          <button
            onClick={desfazer}
            disabled={dirtyCount === 0 || loading || saving}
            className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Desfazer ({dirtyCount})
          </button>

          <button
            onClick={salvar}
            disabled={dirtyCount === 0 || loading || saving}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Salvando..." : `Salvar (${dirtyCount})`}
          </button>
        </div>
      </div>

      {/* Resumo mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <CardTitle>Rendas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600">
            {moneyBRL(resumo.rendas)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Circle className="text-rose-600" size={20} />
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-rose-600">
            {moneyBRL(resumo.despesas)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo</CardTitle>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${resumo.saldo >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {moneyBRL(resumo.saldo)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marcados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-600">
            {resumo.marcados}/{resumo.total}
          </CardContent>
        </Card>
      </div>

      {/* Lista cronológica */}
      <Card>
        <CardHeader>
          <CardTitle>
            Checklist cronológico — {mesLabel} / {ano}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-slate-500 py-6">Carregando...</p>
          ) : itens.length === 0 ? (
            <p className="text-center text-slate-500 py-6">
              Nenhuma renda/despesa encontrada para este mês.
            </p>
          ) : (
            <div className="space-y-2">
              {itens.map((it) => {
                const isRenda = it.tipo === "RENDA";
                const badge =
                  isRenda
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <div
                    key={`${it.financaId}-${it.dataLancamento}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-24 text-sm text-slate-600">
                        <div className="font-medium">
                          {dayjs(it.dataLancamento).format("DD/MM")}
                        </div>
                        <div className="text-xs opacity-80">{ano}</div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{it.nome}</span>
                          <span className={`text-xs border rounded-full px-2 py-0.5 ${badge}`}>
                            {it.tipo}
                          </span>

                          {it.parcelas ? (
                            <span className="text-xs border rounded-full px-2 py-0.5 text-slate-600">
                              Parcela {it.parcelaAtual ?? "-"} / {it.parcelas}
                            </span>
                          ) : null}
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          ID: {it.financaId}
                          {it.checkedAt ? ` • Marcado em ${dayjs(it.checkedAt).format("DD/MM HH:mm")}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className={`font-semibold ${isRenda ? "text-emerald-700" : "text-rose-700"}`}>
                        {moneyBRL(it.valor)}
                      </div>

                      <label className="inline-flex items-center gap-2 border rounded-full px-3 py-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!it.checked}
                          onChange={() => toggle(it.financaId, !!it.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {isRenda ? "Recebi" : "Paguei"}:{" "}
                          <b className={it.checked ? "text-emerald-700" : "text-slate-600"}>
                            {it.checked ? "Sim" : "Não"}
                          </b>
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dica */}
      <Card>
        <CardContent className="text-center py-4 text-slate-700">
          Marque o que você <b>recebeu</b> e o que você <b>pagou</b> no mês e clique em{" "}
          <b>Salvar</b> para gravar o status dessa competência.
        </CardContent>
      </Card>
    </div>
  );
}
