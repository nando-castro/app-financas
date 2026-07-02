import { CalendarCheck, CircleDollarSign, ReceiptText, Scale, TrendingUp } from "lucide-react";
import type { DailyEarningPlanning } from "@/types/earningPlanning";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function EarningPlanningSummary({ days }: { days: DailyEarningPlanning[] }) {
  const income = days.reduce((sum, day) => sum + day.plannedIncome, 0);
  const expense = days.reduce((sum, day) => sum + day.plannedExpense, 0);
  const filled = days.filter((day) => day.plannedIncome > 0 || day.plannedExpense > 0).length;
  const items = [
    { label: "Ganhos planejados", value: money.format(income), icon: CircleDollarSign, color: "text-emerald-600", bar: "bg-emerald-500" },
    { label: "Gastos planejados", value: money.format(expense), icon: ReceiptText, color: "text-rose-600", bar: "bg-rose-500" },
    { label: "Saldo previsto", value: money.format(income - expense), icon: Scale, color: income - expense < 0 ? "text-rose-600" : "text-blue-600", bar: income - expense < 0 ? "bg-rose-500" : "bg-blue-500" },
    { label: "Dias preenchidos", value: `${filled} de ${days.length}`, icon: CalendarCheck, color: "text-violet-600", bar: "bg-violet-500" },
    { label: "Média diária", value: money.format(filled ? income / filled : 0), icon: TrendingUp, color: "text-amber-600", bar: "bg-amber-500" },
  ];

  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {items.map((item) => <div key={item.label} className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
      <div className={`h-1 ${item.bar}`} />
      <div className="flex items-center gap-3 p-4"><item.icon className={item.color} size={21} /><div><p className="text-xs font-medium text-slate-500">{item.label}</p><p className={`mt-1 text-lg font-bold ${item.color}`}>{item.value}</p></div></div>
    </div>)}
  </div>;
}

