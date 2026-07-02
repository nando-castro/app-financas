import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Props {
  month: number;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNavigator({ month, year, onPrevious, onNext, onToday }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex h-10 items-center rounded-lg border bg-white shadow-sm dark:bg-slate-900">
        <button aria-label="Mês anterior" onClick={onPrevious} className="h-full px-3 hover:bg-slate-50 dark:hover:bg-slate-800">
          <ChevronLeft size={17} />
        </button>
        <span className="min-w-40 px-3 text-center text-sm font-semibold">{months[month - 1]} de {year}</span>
        <button aria-label="Próximo mês" onClick={onNext} className="h-full px-3 hover:bg-slate-50 dark:hover:bg-slate-800">
          <ChevronRight size={17} />
        </button>
      </div>
      <Button variant="outline" onClick={onToday}>Hoje</Button>
    </div>
  );
}

