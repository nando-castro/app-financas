import { CalendarCheck, CircleDollarSign, ReceiptText, Scale, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import type { DailyEarningPlanning } from "@/types/earningPlanning";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type EarningPlanningSummaryProps = {
  days: DailyEarningPlanning[];
  month: number;
  year: number;
};

export function EarningPlanningSummary({ days, month, year }: EarningPlanningSummaryProps) {
  const income = days.reduce((sum, day) => sum + day.plannedIncome, 0);
  const expense = days.reduce((sum, day) => sum + day.plannedExpense, 0);
  const today = new Date();
  const lastMonthDay = new Date(year, month, 0).getDate();
  const limitDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : lastMonthDay;
  const daysUntilToday = days.filter((day) => Number(day.day) <= limitDay);
  const accumulatedIncome = daysUntilToday.reduce((sum, day) => sum + day.plannedIncome, 0);
  const accumulatedExpense = daysUntilToday.reduce((sum, day) => sum + day.plannedExpense, 0);
  const filled = days.filter((day) => day.plannedIncome > 0 || day.plannedExpense > 0).length;
  const remainingIncome = Math.max(income - accumulatedIncome, 0);
  const remainingExpense = Math.max(expense - accumulatedExpense, 0);
  const remainingNet = remainingIncome - remainingExpense;
  const mainItems = [
    { label: "Ganhos planejados", value: money.format(income), icon: CircleDollarSign, color: "text-emerald-600", bar: "bg-emerald-500" },
    { label: "Gastos planejados", value: money.format(expense), icon: ReceiptText, color: "text-rose-600", bar: "bg-rose-500" },
    { label: "Saldo previsto", value: money.format(income - expense), icon: Scale, color: income - expense < 0 ? "text-rose-600" : "text-blue-600", bar: income - expense < 0 ? "bg-rose-500" : "bg-blue-500" },
    { label: "Dias preenchidos", value: `${filled} de ${days.length}`, icon: CalendarCheck, color: "text-violet-600", bar: "bg-violet-500" },
    { label: "Média diária", value: money.format(filled ? income / filled : 0), icon: TrendingUp, color: "text-amber-600", bar: "bg-amber-500" },
  ];

  const progressItems = [
    { label: "Já arrecadado", value: money.format(accumulatedIncome), icon: WalletCards, color: "text-teal-600", bar: "bg-teal-500" },
    { label: "Falta arrecadar", value: money.format(remainingIncome), icon: TrendingUp, color: "text-cyan-600", bar: "bg-cyan-500" },
    { label: "Líquido a arrecadar", value: money.format(remainingNet), icon: Scale, color: remainingNet < 0 ? "text-rose-600" : "text-blue-600", bar: remainingNet < 0 ? "bg-rose-500" : "bg-blue-500" },
    { label: "Já gasto", value: money.format(accumulatedExpense), icon: WalletCards, color: "text-pink-600", bar: "bg-pink-500" },
    { label: "Falta gastar", value: money.format(remainingExpense), icon: TrendingDown, color: "text-orange-600", bar: "bg-orange-500" },
  ];

  function renderCards(items: typeof mainItems) {
    return items.map((item) => <div key={item.label} className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
      <div className={`h-1 ${item.bar}`} />
      <div className="flex items-center gap-3 p-4"><item.icon className={item.color} size={21} /><div><p className="text-xs font-medium text-slate-500">{item.label}</p><p className={`mt-1 text-lg font-bold ${item.color}`}>{item.value}</p></div></div>
    </div>);
  }

  return <div className="space-y-3">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {renderCards(mainItems)}
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {renderCards(progressItems)}
    </div>
  </div>;
}
