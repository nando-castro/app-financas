import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type MonthSelectorProps = {
  value: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

export function MonthSelector({ value, year, onChange }: MonthSelectorProps) {
  function moveMonth(direction: number) {
    const next = value + direction;
    if (next < 1) onChange(12, year - 1);
    else if (next > 12) onChange(1, year + 1);
    else onChange(next, year);
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Selecionar mês">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Mês anterior"
        title="Mês anterior"
        disabled={year <= 1 && value === 1}
        onClick={() => moveMonth(-1)}
      >
        <ChevronLeft size={16} />
      </Button>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value), year)}
        aria-label="Mês"
        className="h-9 rounded-md border bg-background px-2 text-sm"
      >
        {months.map((month, index) => (
          <option key={month} value={index + 1}>{month}</option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Próximo mês"
        title="Próximo mês"
        onClick={() => moveMonth(1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
