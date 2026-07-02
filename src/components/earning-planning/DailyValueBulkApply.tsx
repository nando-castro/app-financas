import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleDollarSign, Minus, Plus, ReceiptText } from "lucide-react";
import { useState } from "react";

interface Props {
  disabled?: boolean;
  onApplyIncome: (value: number) => void;
  onApplyExpense: (value: number) => void;
  onRemoveIncome: (value: number) => void;
  onRemoveExpense: (value: number) => void;
}

function valueFromInput(value: string) {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function DailyValueBulkApply({ disabled, onApplyIncome, onApplyExpense, onRemoveIncome, onRemoveExpense }: Props) {
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");

  function applyIncome() {
    const value = valueFromInput(income);
    if (!value) return;
    onApplyIncome(value);
    setIncome("");
  }

  function applyExpense() {
    const value = valueFromInput(expense);
    if (!value) return;
    onApplyExpense(value);
    setExpense("");
  }

  function removeIncome() {
    const value = valueFromInput(income);
    if (!value) return;
    onRemoveIncome(value);
    setIncome("");
  }

  function removeExpense() {
    const value = valueFromInput(expense);
    if (!value) return;
    onRemoveExpense(value);
    setExpense("");
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="mb-3">
        <h2 className="font-semibold">Adicionar valor em todos os dias</h2>
        <p className="text-xs text-slate-500">O valor será somado ao que já estiver preenchido em cada dia do mês.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg bg-emerald-50 p-3 sm:flex-row sm:items-center dark:bg-emerald-950/20">
          <div className="flex min-w-24 items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><CircleDollarSign size={18} />Ganhos</div>
          <div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">R$</span><Input aria-label="Valor de ganho para todos os dias" inputMode="decimal" placeholder="0,00" value={income} onChange={(event) => setIncome(event.target.value.replace(/[^\d,.]/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") applyIncome(); }} className="bg-white pl-9 dark:bg-slate-900" /></div>
          <div className="flex gap-2"><Button type="button" onClick={applyIncome} disabled={disabled || !valueFromInput(income)} className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"><Plus size={16} />Adicionar</Button><Button type="button" variant="outline" onClick={removeIncome} disabled={disabled || !valueFromInput(income)} className="flex-1 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"><Minus size={16} />Remover</Button></div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-rose-50 p-3 sm:flex-row sm:items-center dark:bg-rose-950/20">
          <div className="flex min-w-24 items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400"><ReceiptText size={18} />Gastos</div>
          <div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">R$</span><Input aria-label="Valor de gasto para todos os dias" inputMode="decimal" placeholder="0,00" value={expense} onChange={(event) => setExpense(event.target.value.replace(/[^\d,.]/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") applyExpense(); }} className="bg-white pl-9 dark:bg-slate-900" /></div>
          <div className="flex gap-2"><Button type="button" onClick={applyExpense} disabled={disabled || !valueFromInput(expense)} className="flex-1 gap-1 bg-rose-600 hover:bg-rose-700"><Plus size={16} />Adicionar</Button><Button type="button" variant="outline" onClick={removeExpense} disabled={disabled || !valueFromInput(expense)} className="flex-1 gap-1 border-rose-300 text-rose-700 hover:bg-rose-100"><Minus size={16} />Remover</Button></div>
        </div>
      </div>
    </section>
  );
}
