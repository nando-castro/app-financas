import type { DailyEarningPlanning } from "@/types/earningPlanning";
import { EarningPlanningDayCard } from "./EarningPlanningDayCard";

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function EarningPlanningCalendar({ year, month, days, onChange }: { year: number; month: number; days: DailyEarningPlanning[]; onChange: (day: DailyEarningPlanning) => void }) {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const today = new Date();
  return <section>
    <div className="mb-2 hidden grid-cols-7 gap-2 lg:grid">{weekdays.map((weekday, index) => <div key={weekday} className={`py-2 text-center text-xs font-bold ${index > 4 ? "text-slate-400" : "text-slate-600"}`}>{weekday}</div>)}</div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {Array.from({ length: offset }, (_, index) => <div key={`blank-${index}`} className="hidden min-h-40 rounded-xl border border-dashed bg-slate-50/60 lg:block dark:bg-slate-950/30" />)}
      {days.map((day) => <EarningPlanningDayCard key={day.date} day={day} onChange={onChange} isToday={year === today.getFullYear() && month === today.getMonth() + 1 && day.day === today.getDate()} />)}
    </div>
  </section>;
}

