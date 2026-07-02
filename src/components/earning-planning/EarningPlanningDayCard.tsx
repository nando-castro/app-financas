import { useEffect, useState } from "react";
import type { DailyEarningPlanning } from "@/types/earningPlanning";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function MoneyInput({ value, onChange, tone, label }: { value: number; onChange: (value: number) => void; tone: string; label: string }) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  useEffect(() => {
    if (!focused) setText(value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [value, focused]);

  function parse(input: string) {
    const cleaned = input.replace(/[^\d,.-]/g, "");
    const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
    const number = Number(normalized);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  return <label className="grid grid-cols-[54px_1fr] items-center gap-2 text-xs">
    <span className="text-slate-500">{label}</span>
    <div className="relative"><span className={`absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${tone}`}>R$</span>
      <input
        inputMode="decimal"
        aria-label={`${label} do dia`}
        value={text}
        onFocus={(event) => { setFocused(true); event.currentTarget.select(); }}
        onBlur={() => { setFocused(false); setText(value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }}
        onChange={(event) => { setText(event.target.value); onChange(parse(event.target.value)); }}
        className={`h-8 w-full rounded-md border bg-transparent pl-7 pr-2 text-right text-xs font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${tone}`}
      />
    </div>
  </label>;
}

export function EarningPlanningDayCard({ day, isToday, onChange }: { day: DailyEarningPlanning; isToday: boolean; onChange: (day: DailyEarningPlanning) => void }) {
  const balance = day.plannedIncome - day.plannedExpense;
  return <article className={`min-h-40 rounded-xl border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${isToday ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900" : ""}`}>
    <div className="mb-3 flex items-center justify-between"><span className={`text-sm font-bold ${isToday ? "text-blue-600" : ""}`}>{day.day}</span>{isToday && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">Hoje</span>}</div>
    <div className="space-y-2">
      <MoneyInput label="Ganhos" value={day.plannedIncome} tone="text-emerald-600" onChange={(plannedIncome) => onChange({ ...day, plannedIncome, balance: plannedIncome - day.plannedExpense })} />
      <MoneyInput label="Gastos" value={day.plannedExpense} tone="text-rose-600" onChange={(plannedExpense) => onChange({ ...day, plannedExpense, balance: day.plannedIncome - plannedExpense })} />
      <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs"><span className="font-semibold">Saldo</span><span className={`font-bold ${balance > 0 ? "text-emerald-600" : balance < 0 ? "text-rose-600" : "text-slate-500"}`}>{money.format(balance)}</span></div>
    </div>
  </article>;
}

