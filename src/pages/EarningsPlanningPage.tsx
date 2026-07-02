import { Button } from "@/components/ui/button";
import { EarningPlanningCalendar } from "@/components/earning-planning/EarningPlanningCalendar";
import { EarningPlanningSummary } from "@/components/earning-planning/EarningPlanningSummary";
import { MonthNavigator } from "@/components/earning-planning/MonthNavigator";
import { earningPlanningService } from "@/services/earningPlanningService";
import type { DailyEarningPlanning } from "@/types/earningPlanning";
import { CalendarRange, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EarningsPlanningPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState<DailyEarningPlanning[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    earningPlanningService.getMonth(year, month)
      .then(({ data }) => { if (active) setDays(data.days); })
      .catch(() => { if (active) toast.error("Não foi possível carregar o planejamento."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, month]);

  function moveMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  }

  function goToday() {
    const today = new Date();
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  }

  function updateDay(updated: DailyEarningPlanning) {
    setDays((current) => current.map((day) => day.day === updated.day ? updated : day));
  }

  async function save() {
    setSaving(true);
    try {
      const { data } = await earningPlanningService.saveMonth({
        year,
        month,
        days: days.map(({ day, date, plannedIncome, plannedExpense }) => ({ day, date, plannedIncome, plannedExpense })),
      });
      setDays(data.days);
      toast.success("Planejamento salvo com sucesso.");
    } catch {
      toast.error("Não foi possível salvar o planejamento.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-[1600px] space-y-5">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><div className="mb-2 flex items-center gap-2 text-blue-600"><CalendarRange size={20} /><span className="text-sm font-semibold">Planejamento mensal</span></div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Planejamento de Ganhos</h1><p className="mt-1 text-sm text-slate-500">Planeje seus ganhos e gastos diários para o mês.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><MonthNavigator month={month} year={year} onPrevious={() => moveMonth(-1)} onNext={() => moveMonth(1)} onToday={goToday} /><Button onClick={save} disabled={loading || saving} className="gap-2 bg-blue-600 hover:bg-blue-700">{saving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}Salvar Planejamento</Button></div>
    </header>
    <EarningPlanningSummary days={days} />
    {loading ? <div className="flex min-h-80 items-center justify-center text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={21} />Carregando planejamento...</div> : <EarningPlanningCalendar year={year} month={month} days={days} onChange={updateDay} />}
  </div>;
}

